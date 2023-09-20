import { errorHandler, UrlReader } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { readGithubIntegrationConfigs } from '@backstage/integration';
import { EventBroker } from '@backstage/plugin-events-node';
import { JsonObject, JsonValue } from '@backstage/types';

import express from 'express';
import Router from 'express-promise-router';
import { OpenAPIV3 } from 'openapi-types';
import { Logger } from 'winston';

import {
  fromWorkflowSource,
  Job,
  orchestrator_service_ready_topic,
  ProcessInstance,
  WorkflowDataInputSchemaResponse,
  WorkflowDefinition,
  WorkflowItem,
  WorkflowListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { exec, ExecException } from 'child_process';
import { resolve } from 'path';

import { CloudEventService } from './CloudEventService';
import { DataInputSchemaService } from './DataInputSchemaService';
import { JiraEvent, JiraService } from './JiraService';
import { OpenApiService } from './OpenApiService';
import { ScaffolderService } from './ScaffolderService';
import { WorkflowService } from './WorkflowService';

export interface RouterOptions {
  eventBroker: EventBroker;
  config: Config;
  logger: Logger;
  discovery: DiscoveryApi;
  catalogApi: CatalogApi;
  urlReader: UrlReader;
}

function delay(time: number) {
  return new Promise(r => setTimeout(r, time));
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { eventBroker, config, logger, discovery, catalogApi, urlReader } =
    options;

  const router = Router();
  router.use(express.json());
  router.use('/workflows', express.text());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const sonataFlowBaseUrl =
    config.getOptionalString('orchestrator.baseUrl') ?? 'http://localhost';
  const sonataFlowPort = config.getOptionalNumber('orchestrator.port') ?? 8899;
  logger.info(
    `Using SonataFlow Url of: ${sonataFlowBaseUrl}:${sonataFlowPort}`,
  );
  const sonataFlowResourcesPath = config.getString(
    'orchestrator.sonataFlowService.path',
  );
  const sonataFlowServiceContainer = config.getString(
    'orchestrator.sonataFlowService.container',
  );
  const sonataFlowPersistencePath = config.getString(
    'orchestrator.sonataFlowService.persistence.path',
  );
  const jiraHost =
    config.getOptionalString('orchestrator.sonataFlowService.jira.host') ??
    'localhost';
  const jiraBearerToken =
    config.getOptionalString(
      'orchestrator.sonataFlowService.jira.bearerToken',
    ) ?? '';

  const githubConfigs = readGithubIntegrationConfigs(
    config.getOptionalConfigArray('integrations.github') ?? [],
  );

  const githubToken = githubConfigs[0]?.token;

  if (!githubToken) {
    logger.warn(
      'No GitHub token found. Some features may not work as expected.',
    );
  }

  const cloudEventService = new CloudEventService(
    logger,
    `${sonataFlowBaseUrl}:${sonataFlowPort}`,
  );
  const jiraService = new JiraService(logger, cloudEventService);
  const openApiService = new OpenApiService(logger, discovery);
  const dataInputSchemaService = new DataInputSchemaService(
    logger,
    githubToken,
  );

  const workflowService = new WorkflowService(
    openApiService,
    dataInputSchemaService,
    sonataFlowResourcesPath,
  );

  const scaffolderService: ScaffolderService = new ScaffolderService(
    logger,
    config,
    catalogApi,
    urlReader,
  );

  setupInternalRoutes(
    router,
    sonataFlowBaseUrl,
    sonataFlowPort,
    workflowService,
    openApiService,
    dataInputSchemaService,
    jiraService,
  );
  setupExternalRoutes(router, discovery, scaffolderService);

  await setupSonataflowService(
    sonataFlowBaseUrl,
    sonataFlowPort,
    sonataFlowResourcesPath,
    sonataFlowServiceContainer,
    sonataFlowPersistencePath,
    jiraHost,
    jiraBearerToken,
    logger,
  );

  await eventBroker.publish({
    topic: orchestrator_service_ready_topic,
    eventPayload: {},
  });

  router.use(errorHandler());
  return router;
}

// ======================================================
// Internal Backstage API calls to delegate to SonataFlow
// ======================================================
function setupInternalRoutes(
  router: express.Router,
  sonataFlowBaseUrl: string,
  sonataFlowPort: number,
  workflowService: WorkflowService,
  openApiService: OpenApiService,
  dataInputSchemaService: DataInputSchemaService,
  jiraService: JiraService,
) {
  const fetchWorkflowUri = async (workflowId: string): Promise<string> => {
    const uriResponse = await executeWithRetry(() =>
      fetch(
        `${sonataFlowBaseUrl}:${sonataFlowPort}/management/processes/${workflowId}/sources`,
      ),
    );

    const json = await uriResponse.json();
    // Assuming only one source in the list
    return json[0].uri;
  };

  const fetchWorkflowDefinition = async (
    workflowId: string,
  ): Promise<WorkflowDefinition> => {
    const sourceResponse = await executeWithRetry(() =>
      fetch(
        `${sonataFlowBaseUrl}:${sonataFlowPort}/management/processes/${workflowId}/source`,
      ),
    );

    const source = await sourceResponse.text();
    return fromWorkflowSource(source);
  };

  const fetchOpenApi = async (): Promise<OpenAPIV3.Document> => {
    const svcOpenApiResponse = await executeWithRetry(() =>
      fetch(`${sonataFlowBaseUrl}:${sonataFlowPort}/q/openapi.json`),
    );
    return await svcOpenApiResponse.json();
  };

  router.get('/workflows', async (_, res) => {
    const svcResponse = await executeWithRetry(() =>
      fetch(`${sonataFlowBaseUrl}:${sonataFlowPort}/management/processes`),
    );
    const ids = await svcResponse.json();
    const items: WorkflowItem[] = await Promise.all(
      ids?.map(
        async (workflowId: String) =>
          await fetch(
            `${sonataFlowBaseUrl}:${sonataFlowPort}/management/processes/${workflowId}`,
          )
            .then((response: Response) => response.json())
            .then(async (definition: WorkflowDefinition) => {
              const uri = await fetchWorkflowUri(definition.id);
              const workflowItem: WorkflowItem = {
                uri,
                definition: {
                  ...definition,
                  description: definition.description ?? definition.name,
                },
              };
              return workflowItem;
            }),
      ),
    );
    const result: WorkflowListResult = {
      items: items ? items : [],
      limit: 0,
      offset: 0,
      totalCount: items ? items.length : 0,
    };
    res.status(200).json(result);
  });

  router.get('/workflows/:workflowId', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const definition = await fetchWorkflowDefinition(workflowId);
    const uri = await fetchWorkflowUri(workflowId);

    res.status(200).json({
      uri,
      definition,
    });
  });

  router.post('/workflows/:workflowId/execute', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    const inputData = req.body;
    const svcResponse = await fetch(
      `${sonataFlowBaseUrl}:${sonataFlowPort}/${workflowId}`,
      {
        method: 'POST',
        body: JSON.stringify(inputData),
        headers: { 'content-type': 'application/json' },
      },
    );
    const json = await svcResponse.json();
    if (!json.id) {
      res.status(svcResponse.status).send();
      return;
    }
    res.status(200).json(json);
  });

  router.get('/instances', async (_, res) => {
    const graphQlQuery =
      '{ ProcessInstances (where: {processId: {isNull: false} } ) { id, processName, processId, state, start, lastUpdate, end, nodes { id }, variables, parentProcessInstance {id, processName, businessKey} } }';
    const svcResponse = await executeWithRetry(() =>
      fetch(`${sonataFlowBaseUrl}:${sonataFlowPort}/graphql`, {
        method: 'POST',
        body: JSON.stringify({ query: graphQlQuery }),
        headers: { 'content-type': 'application/json' },
      }),
    );
    const json = await svcResponse.json();
    const processInstances: ProcessInstance[] = json.data
      .ProcessInstances as ProcessInstance[];
    res.status(200).json(processInstances);
  });

  router.get('/instances/:instanceId', async (req, res) => {
    const {
      params: { instanceId },
    } = req;
    const graphQlQuery = `{ ProcessInstances (where: { id: {equal: "${instanceId}" } } ) { id, processName, processId, state, start, lastUpdate, end, nodes { id, nodeId, definitionId, type, name, enter, exit }, variables, parentProcessInstance {id, processName, businessKey}, error { nodeDefinitionId, message} } }`;
    const svcResponse = await executeWithRetry(() =>
      fetch(`${sonataFlowBaseUrl}:${sonataFlowPort}/graphql`, {
        method: 'POST',
        body: JSON.stringify({ query: graphQlQuery }),
        headers: { 'content-type': 'application/json' },
      }),
    );
    const json = await svcResponse.json();
    const processInstances: ProcessInstance[] = json.data
      .ProcessInstances as ProcessInstance[];
    const processInstance: ProcessInstance = processInstances[0];
    res.status(200).json(processInstance);
  });

  router.get('/instances/:instanceId/jobs', async (req, res) => {
    const {
      params: { instanceId },
    } = req;
    const graphQlQuery = `{ Jobs (where: { processInstanceId: { equal: "${instanceId}" } }) { id, processId, processInstanceId, rootProcessId, status, expirationTime, priority, callbackEndpoint, repeatInterval, repeatLimit, scheduledId, retries, lastUpdate, endpoint, nodeInstanceId, executionCounter } }`;
    const svcResponse = await executeWithRetry(() =>
      fetch(`${sonataFlowBaseUrl}:${sonataFlowPort}/graphql`, {
        method: 'POST',
        body: JSON.stringify({ query: graphQlQuery }),
        headers: { 'content-type': 'application/json' },
      }),
    );
    const json = await svcResponse.json();
    const jobs: Job[] = json.data.Jobs as Job[];
    res.status(200).json(jobs);
  });

  router.get('/workflows/:workflowId/schema', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const definition = await fetchWorkflowDefinition(workflowId);
    const uri = await fetchWorkflowUri(workflowId);

    const workflowItem: WorkflowItem = { uri, definition };

    const openApi = await fetchOpenApi();
    const workflowDataInputSchema =
      await dataInputSchemaService.resolveDataInputSchema({
        openApi,
        workflowId,
      });

    if (!workflowDataInputSchema) {
      res.status(404).send();
      return;
    }

    const response: WorkflowDataInputSchemaResponse = {
      workflowItem: workflowItem,
      schema: workflowDataInputSchema,
    };

    res.status(200).json(response);
  });

  router.delete('/workflows/:workflowId', async (req, res) => {
    const workflowId = req.params.workflowId;
    const uri = await fetchWorkflowUri(workflowId);
    await workflowService.deleteWorkflowDefinitionById(uri);
    res.status(201).send();
  });

  router.post('/workflows', async (req, res) => {
    const uri = req.query.uri as string;
    const workflowItem = uri?.startsWith('http')
      ? await workflowService.saveWorkflowDefinitionFromUrl(uri)
      : await workflowService.saveWorkflowDefinition({
          uri,
          definition: fromWorkflowSource(req.body),
        });
    res.status(201).json(workflowItem).send();
  });

  router.get('/actions/schema', async (_, res) => {
    const openApi = await openApiService.generateOpenApi();
    res.json(openApi).status(200).send();
  });

  router.put('/actions/schema', async (_, res) => {
    const openApi = await workflowService.saveOpenApi();
    res.json(openApi).status(200).send();
  });

  router.post('/webhook/jira', async (req, res) => {
    const event = req.body as JiraEvent;
    await jiraService.handleEvent(event);
    res.status(200).send();
  });

  router.get('/specs', async (_, res) => {
    const specs = await workflowService.listStoredSpecs();
    res.json(specs).status(200).send();
  });
}

// ======================================================
// External SonataFlow API calls to delegate to Backstage
// ======================================================
function setupExternalRoutes(
  router: express.Router,
  discovery: DiscoveryApi,
  scaffolderService: ScaffolderService,
) {
  router.get('/actions', async (_, res) => {
    const scaffolderUrl = await discovery.getBaseUrl('scaffolder');
    const response = await fetch(`${scaffolderUrl}/v2/actions`);
    const json = await response.json();
    res.status(response.status).json(json);
  });

  router.post('/actions/:actionId', async (req, res) => {
    const { actionId } = req.params;
    const instanceId: string | undefined = req.header('kogitoprocinstanceid');
    const body: JsonObject = (await req.body) as JsonObject;
    const result: JsonValue = await scaffolderService.executeAction({
      actionId,
      instanceId,
      input: body,
    });
    res.status(200).json(result);
  });
}

// =============================================
// Spawn a process to run the SonataFlow service
// =============================================
async function setupSonataflowService(
  sonataFlowBaseUrl: string,
  sonataFlowPort: number,
  sonataFlowResourcesPath: string,
  sonataFlowServiceContainer: string,
  sonataFlowPersistencePath: string,
  jiraHost: string,
  jiraBearerToken: string,
  logger: Logger,
) {
  const sonataFlowResourcesAbsPath = resolve(`${sonataFlowResourcesPath}`);
  const launcher = `docker run --add-host jira.test:${jiraHost} --add-host host.docker.internal:host-gateway --rm -p ${sonataFlowPort}:8080 -v ${sonataFlowResourcesAbsPath}:/home/kogito/serverless-workflow-project/src/main/resources -e KOGITO.CODEGEN.PROCESS.FAILONERROR=false -e QUARKUS_EMBEDDED_POSTGRESQL_DATA_DIR=${sonataFlowPersistencePath} -e QUARKUS_REST_CLIENT_JIRA_OPENAPI_JSON_URL=http://jira.test:8080 -e JIRABEARERTOKEN=${jiraBearerToken} ${sonataFlowServiceContainer}`;
  exec(
    launcher,
    (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log(`stdout:\n${stdout}`);
    },
  );

  // We need to ensure the service is running!
  try {
    await executeWithRetry(() =>
      fetch(`${sonataFlowBaseUrl}:${sonataFlowPort}/q/health`),
    );
  } catch (e) {
    logger.error(
      'SonataFlow failed to start. Workflow definitions could not be loaded.',
    );
  }
}

async function executeWithRetry(
  action: () => Promise<Response>,
): Promise<Response> {
  let response: Response;
  let errorCount = 0;
  // execute with retry
  const backoff = 3000;
  const maxErrors = 15;
  while (errorCount < maxErrors) {
    try {
      response = await action();
      if (response.status >= 400) {
        errorCount++;
        // backoff
        await delay(backoff);
      } else {
        return response;
      }
    } catch (e) {
      errorCount++;
      await delay(backoff);
    }
  }
  throw new Error('Unable to execute query.');
}

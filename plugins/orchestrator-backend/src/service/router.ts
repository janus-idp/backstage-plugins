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
  ProcessInstance,
  swf_service_ready_topic,
  SwfDefinition,
  SwfItem,
  SwfListResult,
  WorkflowDataInputSchemaResponse,
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

  const kogitoBaseUrl =
    config.getOptionalString('swf.baseUrl') ?? 'http://localhost';
  const kogitoPort = config.getOptionalNumber('swf.port') ?? 8899;
  logger.info(
    `Using kogito Serverless Workflow Url of: ${kogitoBaseUrl}:${kogitoPort}`,
  );
  const kogitoResourcesPath = config.getString('swf.workflowService.path');
  const kogitoServiceContainer = config.getString(
    'swf.workflowService.container',
  );
  const kogitoPersistencePath = config.getString(
    'swf.workflowService.persistence.path',
  );
  const jiraHost =
    config.getOptionalString('swf.workflowService.jira.host') ?? 'localhost';
  const jiraBearerToken =
    config.getOptionalString('swf.workflowService.jira.bearerToken') ?? '';

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
    `${kogitoBaseUrl}:${kogitoPort}`,
  );
  const jiraService = new JiraService(logger, cloudEventService);
  const openApiService = new OpenApiService(
    logger,
    discovery,
    kogitoResourcesPath,
  );
  const dataInputSchemaService = new DataInputSchemaService(
    logger,
    githubToken,
  );

  const workflowService = new WorkflowService(
    openApiService,
    dataInputSchemaService,
    kogitoResourcesPath,
  );

  const scaffolderService: ScaffolderService = new ScaffolderService(
    logger,
    config,
    catalogApi,
    urlReader,
  );

  setupInternalRoutes(
    router,
    kogitoBaseUrl,
    kogitoPort,
    workflowService,
    openApiService,
    dataInputSchemaService,
    jiraService,
  );
  setupExternalRoutes(router, discovery, scaffolderService);

  await setupKogitoService(
    kogitoBaseUrl,
    kogitoPort,
    kogitoResourcesPath,
    kogitoServiceContainer,
    kogitoPersistencePath,
    jiraHost,
    jiraBearerToken,
    logger,
  );

  await eventBroker.publish({
    topic: swf_service_ready_topic,
    eventPayload: {},
  });

  router.use(errorHandler());
  return router;
}

// ==================================================
// Internal Backstage API calls to delegate to Kogito
// ==================================================
function setupInternalRoutes(
  router: express.Router,
  kogitoBaseUrl: string,
  kogitoPort: number,
  workflowService: WorkflowService,
  openApiService: OpenApiService,
  dataInputSchemaService: DataInputSchemaService,
  jiraService: JiraService,
) {
  const fetchWorkflowUri = async (swfId: string): Promise<string> => {
    const uriResponse = await executeWithRetry(() =>
      fetch(
        `${kogitoBaseUrl}:${kogitoPort}/management/processes/${swfId}/sources`,
      ),
    );

    const json = await uriResponse.json();
    // Assuming only one source in the list
    return json[0].uri;
  };

  const fetchWorkflowDefinition = async (
    swfId: string,
  ): Promise<SwfDefinition> => {
    const sourceResponse = await executeWithRetry(() =>
      fetch(
        `${kogitoBaseUrl}:${kogitoPort}/management/processes/${swfId}/source`,
      ),
    );

    const source = await sourceResponse.text();
    return fromWorkflowSource(source);
  };

  const fetchOpenApi = async (): Promise<OpenAPIV3.Document> => {
    const svcOpenApiResponse = await executeWithRetry(() =>
      fetch(`${kogitoBaseUrl}:${kogitoPort}/q/openapi.json`),
    );
    return await svcOpenApiResponse.json();
  };

  router.get('/items', async (_, res) => {
    const svcResponse = await executeWithRetry(() =>
      fetch(`${kogitoBaseUrl}:${kogitoPort}/management/processes`),
    );
    const ids = await svcResponse.json();
    const items: SwfItem[] = await Promise.all(
      ids?.map(
        async (swfId: String) =>
          await fetch(
            `${kogitoBaseUrl}:${kogitoPort}/management/processes/${swfId}`,
          )
            .then((swfResponse: Response) => swfResponse.json())
            .then(async (definition: SwfDefinition) => {
              const uri = await fetchWorkflowUri(definition.id);
              const swfItem: SwfItem = {
                uri,
                definition: {
                  ...definition,
                  description: definition.description ?? definition.name,
                },
              };
              return swfItem;
            }),
      ),
    );
    const result: SwfListResult = {
      items: items ? items : [],
      limit: 0,
      offset: 0,
      totalCount: items ? items.length : 0,
    };
    res.status(200).json(result);
  });

  router.get('/items/:swfId', async (req, res) => {
    const {
      params: { swfId },
    } = req;

    const definition = await fetchWorkflowDefinition(swfId);
    const uri = await fetchWorkflowUri(swfId);

    res.status(200).json({
      uri,
      definition,
    });
  });

  router.post('/execute/:swfId', async (req, res) => {
    const {
      params: { swfId },
    } = req;
    const swfData = req.body;
    const svcResponse = await fetch(`${kogitoBaseUrl}:${kogitoPort}/${swfId}`, {
      method: 'POST',
      body: JSON.stringify(swfData),
      headers: { 'content-type': 'application/json' },
    });
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
      fetch(`${kogitoBaseUrl}:${kogitoPort}/graphql`, {
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
      fetch(`${kogitoBaseUrl}:${kogitoPort}/graphql`, {
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
      fetch(`${kogitoBaseUrl}:${kogitoPort}/graphql`, {
        method: 'POST',
        body: JSON.stringify({ query: graphQlQuery }),
        headers: { 'content-type': 'application/json' },
      }),
    );
    const json = await svcResponse.json();
    const jobs: Job[] = json.data.Jobs as Job[];
    res.status(200).json(jobs);
  });

  router.get('/items/:swfId/schema', async (req, res) => {
    const {
      params: { swfId },
    } = req;

    const definition = await fetchWorkflowDefinition(swfId);
    const uri = await fetchWorkflowUri(swfId);

    const swfItem: SwfItem = { uri, definition };

    const openApi = await fetchOpenApi();
    const workflowDataInputSchema =
      await dataInputSchemaService.resolveDataInputSchema({
        openApi,
        swfId,
      });

    if (!workflowDataInputSchema) {
      res.status(404).send();
      return;
    }

    const response: WorkflowDataInputSchemaResponse = {
      swfItem,
      schema: workflowDataInputSchema,
    };

    res.status(200).json(response);
  });

  router.delete('/workflows/:swfId', async (req, res) => {
    const swfId = req.params.swfId;
    const uri = await fetchWorkflowUri(swfId);
    await workflowService.deleteWorkflowDefinitionById(uri);
    res.status(201).send();
  });

  router.post('/workflows', async (req, res) => {
    const uri = req.query.uri as string;
    const swfItem = uri?.startsWith('http')
      ? await workflowService.saveWorkflowDefinitionFromUrl(uri)
      : await workflowService.saveWorkflowDefinition({
          uri,
          definition: fromWorkflowSource(req.body),
        });
    res.status(201).json(swfItem).send();
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

// ==================================================
// External Kogito API calls to delegate to Backstage
// ==================================================
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

// =========================================
// Spawn a process to run the Kogito service
// =========================================
async function setupKogitoService(
  kogitoBaseUrl: string,
  kogitoPort: number,
  kogitoResourcesPath: string,
  kogitoServiceContainer: string,
  kogitoPersistencePath: string,
  jiraHost: string,
  jiraBearerToken: string,
  logger: Logger,
) {
  const kogitoResourcesAbsPath = resolve(`${kogitoResourcesPath}`);
  const launcher = `docker run --add-host jira.test:${jiraHost} --add-host host.docker.internal:host-gateway --rm -p ${kogitoPort}:8080 -v ${kogitoResourcesAbsPath}:/home/kogito/serverless-workflow-project/src/main/resources -e KOGITO.CODEGEN.PROCESS.FAILONERROR=false -e QUARKUS_EMBEDDED_POSTGRESQL_DATA_DIR=${kogitoPersistencePath} -e QUARKUS_REST_CLIENT_JIRA_OPENAPI_JSON_URL=http://jira.test:8080 -e JIRABEARERTOKEN=${jiraBearerToken} ${kogitoServiceContainer}`;
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
      fetch(`${kogitoBaseUrl}:${kogitoPort}/q/health`),
    );
  } catch (e) {
    logger.error(
      'Kogito failed to start. Serverless Workflow Templates could not be loaded.',
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

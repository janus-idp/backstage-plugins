import { errorHandler } from '@backstage/backend-common';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ScmIntegrations } from '@backstage/integration';
import { JsonObject, JsonValue } from '@backstage/types';

import express from 'express';
import Router from 'express-promise-router';
import { OpenAPIBackend, Request } from 'openapi-backend';

import {
  AssessedProcessInstance,
  fromWorkflowSource,
  openApiDocument,
  ORCHESTRATOR_SERVICE_READY_TOPIC,
  ProcessInstance,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_BUSINESS_KEY,
  QUERY_PARAM_INCLUDE_ASSESSMENT,
  QUERY_PARAM_INSTANCE_ID,
  QUERY_PARAM_URI,
  WorkflowDefinition,
  WorkflowInfo,
  WorkflowInputSchemaResponse,
  WorkflowItem,
  WorkflowListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { RouterArgs } from '../routerWrapper';
import { ApiResponseBuilder } from '../types/apiResponse';
import { getWorkflowOverviewV1 } from './api/v1';
import { getWorkflowOverviewV2 } from './api/v2';
import { CloudEventService } from './CloudEventService';
import { DataIndexService } from './DataIndexService';
import { DataInputSchemaService } from './DataInputSchemaService';
import { JiraEvent, JiraService } from './JiraService';
import { OpenApiService } from './OpenApiService';
import { ScaffolderService } from './ScaffolderService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowService } from './WorkflowService';

interface Services {
  sonataFlowService: SonataFlowService;
  workflowService: WorkflowService;
  openApiService: OpenApiService;
  jiraService: JiraService;
  dataIndexService: DataIndexService;
  dataInputSchemaService: DataInputSchemaService;
}
export async function createBackendRouter(
  args: RouterArgs & {
    sonataFlowService: SonataFlowService;
    dataIndexService: DataIndexService;
  },
): Promise<express.Router> {
  const { eventBroker, config, logger, discovery, catalogApi, urlReader } =
    args;

  const api = initOpenAPIBackend();
  await api.init();

  const router = Router();
  router.use(express.json());
  router.use('/workflows', express.text());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const githubIntegration = ScmIntegrations.fromConfig(config)
    .github.list()
    .pop();

  const githubToken = githubIntegration?.config.token;

  if (!githubToken) {
    logger.warn(
      'No GitHub token found. Some features may not work as expected.',
    );
  }

  const cloudEventService = new CloudEventService(logger);
  const jiraService = new JiraService(logger, cloudEventService);
  const openApiService = new OpenApiService(logger, discovery);
  const dataInputSchemaService = new DataInputSchemaService(
    logger,
    githubToken,
  );

  const workflowService = new WorkflowService(
    openApiService,
    dataInputSchemaService,
    args.sonataFlowService,
    config,
    logger,
  );

  const scaffolderService: ScaffolderService = new ScaffolderService(
    logger,
    config,
    catalogApi,
    urlReader,
  );

  await workflowService.reloadWorkflows();

  const services: Services = {
    sonataFlowService: args.sonataFlowService,
    workflowService,
    openApiService,
    jiraService,
    dataIndexService: args.dataIndexService,
    dataInputSchemaService,
  };

  setupInternalRoutes(router, api, services);
  setupExternalRoutes(router, discovery, scaffolderService);

  await eventBroker.publish({
    topic: ORCHESTRATOR_SERVICE_READY_TOPIC,
    eventPayload: {},
  });

  router.use((req, res, next) => {
    if (!next) {
      throw new Error('next is undefined');
    }

    // const validation = api.validateRequest(req as Request);
    // if (!validation.valid) {
    //   console.log('errors: ', validation.errors);
    //   throw validation.errors;
    // }

    api.handleRequest(req as Request, req, res, next);
  });

  router.use(errorHandler());
  return router;
}

function initOpenAPIBackend(): OpenAPIBackend {
  return new OpenAPIBackend({
    definition: openApiDocument,
    strict: false,
    ajvOpts: {
      strict: false,
      strictSchema: false,
      verbose: true,
      addUsedSchema: false,
    },
  });
}

// ======================================================
// Internal Backstage API calls to delegate to SonataFlow
// ======================================================
function setupInternalRoutes(
  router: express.Router,
  api: OpenAPIBackend,
  services: Services,
) {
  router.get('/workflows/definitions', async (_, response) => {
    const swfs = await services.dataIndexService.getWorkflowDefinitions();
    response.json(ApiResponseBuilder.SUCCESS_RESPONSE(swfs));
  });

  router.get('/workflows/overview', async (_c, res) => {
    await getWorkflowOverviewV1(services.sonataFlowService)
      .then(result => res.status(200).json(result))
      .catch(error => {
        res.status(500).send(error.message || 'Internal Server Error');
      });
  });

  // v2
  api.register(
    'getWorkflowsOverview',
    async (_c, _req, res: express.Response, next) => {
      await getWorkflowOverviewV2(services.sonataFlowService)
        .then(result => res.json(result))
        .catch(error => {
          res.status(500).send(error.message || 'Internal Server Error');
          next();
        });
    },
  );

  router.get('/workflows', async (_, res) => {
    const definitions: WorkflowInfo[] =
      await services.dataIndexService.getWorkflowDefinitions();
    const items: WorkflowItem[] = await Promise.all(
      definitions.map(async info => {
        const uri = await services.sonataFlowService.fetchWorkflowUri(info.id);
        if (!uri) {
          throw new Error(`Uri is required for workflow ${info.id}`);
        }
        const item: WorkflowItem = {
          definition: info as WorkflowDefinition,
          serviceUrl: info.serviceUrl,
          uri,
        };
        return item;
      }),
    );

    if (!items) {
      res.status(500).send("Couldn't fetch workflows");
      return;
    }

    const result: WorkflowListResult = {
      items: items,
      limit: 0,
      offset: 0,
      totalCount: items?.length ?? 0,
    };
    res.status(200).json(result);
  });

  router.get('/workflows/:workflowId', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const definition =
      await services.sonataFlowService.fetchWorkflowDefinition(workflowId);

    if (!definition) {
      res
        .status(500)
        .send(`Couldn't fetch workflow definition for ${workflowId}`);
      return;
    }

    const uri = await services.sonataFlowService.fetchWorkflowUri(workflowId);
    if (!uri) {
      res.status(500).send(`Couldn't fetch workflow uri for ${workflowId}`);
      return;
    }

    res.status(200).json({
      uri,
      definition,
    });
  });

  router.delete('/workflows/:workflowId/abort', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const result =
      await services.dataIndexService.abortWorkflowInstance(workflowId);

    if (result.error) {
      res.status(500).json(result.error);
      return;
    }

    res.status(200).json(result.data);
  });

  router.post('/workflows/:workflowId/execute', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const businessKey = extractQueryParam(req, QUERY_PARAM_BUSINESS_KEY);

    const definition =
      await services.dataIndexService.getWorkflowDefinition(workflowId);
    const serviceUrl = definition.serviceUrl;
    if (!serviceUrl) {
      throw new Error(`ServiceURL is not defined for workflow ${workflowId}`);
    }
    const executionResponse = await services.sonataFlowService.executeWorkflow({
      workflowId,
      inputData: req.body,
      endpoint: serviceUrl,
      businessKey,
    });

    if (!executionResponse) {
      res.status(500).send(`Couldn't execute workflow ${workflowId}`);
      return;
    }

    res.status(200).json(executionResponse);
  });

  router.get('/workflows/:workflowId/overview', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    const overviewObj =
      await services.sonataFlowService.fetchWorkflowOverview(workflowId);

    if (!overviewObj) {
      res
        .status(500)
        .send(`Couldn't fetch workflow overview for ${workflowId}`);
      return;
    }
    res.status(200).json(overviewObj);
  });

  router.get('/instances', async (_, res) => {
    const instances = await services.dataIndexService.fetchProcessInstances();

    if (!instances) {
      res.status(500).send("Couldn't fetch process instances");
      return;
    }

    res.status(200).json(instances);
  });

  router.get('/instances/:instanceId', async (req, res) => {
    const {
      params: { instanceId },
    } = req;

    const includeAssessment = extractQueryParam(
      req,
      QUERY_PARAM_INCLUDE_ASSESSMENT,
    );

    const instance =
      await services.dataIndexService.fetchProcessInstance(instanceId);

    if (!instance) {
      res.status(500).send(`Couldn't fetch process instance ${instanceId}`);
      return;
    }

    let assessedByInstance: ProcessInstance | undefined;

    if (!!includeAssessment && instance.businessKey) {
      assessedByInstance = await services.dataIndexService.fetchProcessInstance(
        instance.businessKey,
      );
    }

    const response: AssessedProcessInstance = {
      instance,
      assessedBy: assessedByInstance,
    };

    res.status(200).json(response);
  });

  router.get('/instances/:instanceId/jobs', async (req, res) => {
    const {
      params: { instanceId },
    } = req;

    const jobs =
      await services.dataIndexService.fetchProcessInstanceJobs(instanceId);

    if (!jobs) {
      res.status(500).send(`Couldn't fetch jobs for instance ${instanceId}`);
      return;
    }

    res.status(200).json(jobs);
  });

  router.get('/workflows/:workflowId/inputSchema', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const instanceId = extractQueryParam(req, QUERY_PARAM_INSTANCE_ID);
    const assessmentInstanceId = extractQueryParam(
      req,
      QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
    );

    const workflowDefinition =
      await services.dataIndexService.getWorkflowDefinition(workflowId);
    const serviceUrl = workflowDefinition.serviceUrl;
    if (!serviceUrl) {
      throw new Error(`ServiceUrl is not defined for workflow ${workflowId}`);
    }

    // workflow source
    const definition =
      await services.sonataFlowService.fetchWorkflowDefinition(workflowId);

    if (!definition) {
      res.status(500).send(`Couldn't fetch workflow definition ${workflowId}`);
      return;
    }

    const uri = await services.sonataFlowService.fetchWorkflowUri(workflowId);

    if (!uri) {
      res.status(500).send(`Couldn't fetch workflow uri ${workflowId}`);
      return;
    }

    const workflowItem: WorkflowItem = { uri, definition };

    const response: WorkflowInputSchemaResponse = {
      workflowItem,
      schemaSteps: [],
      isComposedSchema: false,
    };

    if (!definition.dataInputSchema) {
      res.status(200).json(response);
      return;
    }

    const workflowInfo = await services.sonataFlowService.fetchWorkflowInfo(
      workflowId,
      serviceUrl,
    );

    if (!workflowInfo) {
      res.status(500).send(`couldn't fetch workflow info ${workflowId}`);
      return;
    }

    if (!workflowInfo.inputSchema) {
      res
        .status(500)
        .send(`failed to retreive schema ${definition.dataInputSchema}`);
      return;
    }

    const instanceVariables = instanceId
      ? await services.dataIndexService.fetchProcessInstanceVariables(
          instanceId,
        )
      : undefined;

    const assessmentInstanceVariables = assessmentInstanceId
      ? await services.dataIndexService.fetchProcessInstanceVariables(
          assessmentInstanceId,
        )
      : undefined;

    res
      .status(200)
      .json(
        services.dataInputSchemaService.getWorkflowInputSchemaResponse(
          workflowItem,
          workflowInfo.inputSchema,
          instanceVariables,
          assessmentInstanceVariables,
        ),
      );
  });

  router.delete('/workflows/:workflowId', async (req, res) => {
    const workflowId = req.params.workflowId;
    const uri = await services.sonataFlowService.fetchWorkflowUri(workflowId);

    if (!uri) {
      res.status(500).send(`Couldn't fetch workflow uri ${workflowId}`);
      return;
    }

    await services.workflowService.deleteWorkflowDefinitionById(uri);
    res.status(200).send();
  });

  router.post('/workflows', async (req, res) => {
    const uri = extractQueryParam(req, QUERY_PARAM_URI);

    if (!uri) {
      res.status(400).send('uri query param is required');
      return;
    }

    const workflowItem = uri?.startsWith('http')
      ? await services.workflowService.saveWorkflowDefinitionFromUrl(uri)
      : await services.workflowService.saveWorkflowDefinition({
          uri,
          definition: fromWorkflowSource(req.body),
        });
    res.status(201).json(workflowItem).send();
  });

  router.get('/actions/schema', async (_, res) => {
    const openApi = await services.openApiService.generateOpenApi();
    res.json(openApi).status(200).send();
  });

  router.put('/actions/schema', async (_, res) => {
    const openApi = await services.workflowService.saveOpenApi();
    res.json(openApi).status(200).send();
  });

  router.post('/webhook/jira', async (req, res) => {
    const event = req.body as JiraEvent;
    await services.jiraService.handleEvent(event);
    res.status(200).send();
  });

  router.get('/specs', async (_, res) => {
    const specs = await services.workflowService.listStoredSpecs();
    res.status(200).json(specs);
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

    const filteredBody = Object.fromEntries(
      Object.entries(body).filter(
        ([, value]) => value !== undefined && value !== null,
      ),
    );

    const result: JsonValue = await scaffolderService.executeAction({
      actionId,
      instanceId,
      input: filteredBody,
    });
    res.status(200).json(result);
  });
}

function extractQueryParam(
  req: express.Request,
  key: string,
): string | undefined {
  return req.query[key] as string | undefined;
}

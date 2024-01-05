import { errorHandler } from '@backstage/backend-common';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ScmIntegrations } from '@backstage/integration';
import { JsonObject, JsonValue } from '@backstage/types';

import express from 'express';
import Router from 'express-promise-router';
import { JSONSchema7 } from 'json-schema';
import { OpenAPIBackend, Options, Request } from 'openapi-backend';

import {
  AssessedProcessInstance,
  fromWorkflowSource,
  ORCHESTRATOR_SERVICE_READY_TOPIC,
  ProcessInstance,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_BUSINESS_KEY,
  QUERY_PARAM_INCLUDE_ASSESSMENT,
  QUERY_PARAM_INSTANCE_ID,
  QUERY_PARAM_URI,
  WorkflowDataInputSchemaResponse,
  WorkflowDefinition,
  WorkflowInfo,
  WorkflowItem,
  WorkflowListResult,
  WorkflowOverviewListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import path from 'path';

import { RouterArgs } from '../routerWrapper';
import { ApiResponseBuilder } from '../types/apiResponse';
import { CloudEventService } from './CloudEventService';
import { DataIndexService } from './DataIndexService';
import { DataInputSchemaService } from './DataInputSchemaService';
import { JiraEvent, JiraService } from './JiraService';
import { OpenApiService } from './OpenApiService';
import { ScaffolderService } from './ScaffolderService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowService } from './WorkflowService';

export async function createBackendRouter(
  args: RouterArgs & {
    sonataFlowService: SonataFlowService;
    dataIndexService: DataIndexService;
  },
): Promise<express.Router> {
  const { eventBroker, config, logger, discovery, catalogApi, urlReader } =
    args;

  // Avoid hard coded path
  // https://issues.redhat.com/browse/FLPATH-932
  const openapiFolderPath = path.join(
    process.cwd(),
    '..',
    '..',
    'plugins',
    'orchestrator-common',
    'api',
  );
  const api = new OpenAPIBackend(setOpenAPIOptions(openapiFolderPath));
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

  setupInternalRoutes(
    router,
    args.sonataFlowService,
    workflowService,
    openApiService,
    jiraService,
    args.dataIndexService,
    dataInputSchemaService,
  );
  setupExternalRoutes(router, discovery, scaffolderService);

  await eventBroker.publish({
    topic: ORCHESTRATOR_SERVICE_READY_TOPIC,
    eventPayload: {},
  });

  router.use(errorHandler());
  return router;
}

function setOpenAPIOptions(openapiFolderPath: string): Options {
  return {
    definition: path.join(openapiFolderPath, 'openapi.yaml'),
    strict: false,
    ajvOpts: {
      strict: false,
      strictSchema: false,
      verbose: true,
      addUsedSchema: false,
    },
    handlers: {
      validationFail: async (
        c,
        req: express.Request,
        res: express.Response,
      ) => {
        console.log('validationFail', c.operation);
        res.status(400).json({ err: c.validation.errors });
      },
      notFound: async (c, req: express.Request, res: express.Response) =>
        res.status(404).json({ err: 'not found' }),
      notImplemented: async (c, req: express.Request, res: express.Response) =>
        res.status(500).json({ err: 'not implemented' }),
    },
  };
}

// ======================================================
// Internal Backstage API calls to delegate to SonataFlow
// ======================================================
function setupInternalRoutes(
  router: express.Router,
  sonataFlowService: SonataFlowService,
  workflowService: WorkflowService,
  openApiService: OpenApiService,
  jiraService: JiraService,
  dataIndexService: DataIndexService,
  dataInputSchemaService: DataInputSchemaService,
) {
  router.get('/workflows/definitions', async (_, response) => {
    const swfs = await dataIndexService.getWorkflowDefinitions();
    response.json(ApiResponseBuilder.SUCCESS_RESPONSE(swfs));
  });

  router.get('/workflows/overview', async (_, res) => {
    const overviews = await sonataFlowService.fetchWorkflowOverviews();

    if (!overviews) {
      res.status(500).send("Couldn't fetch workflow overviews");
      return;
    }

    const result: WorkflowOverviewListResult = {
      items: overviews,
      limit: 0,
      offset: 0,
      totalCount: overviews?.length ?? 0,
    };
    res.status(200).json(result);
  });

  router.get('/workflows', async (_, res) => {
    const definitions: WorkflowInfo[] =
      await dataIndexService.getWorkflowDefinitions();
    const items: WorkflowItem[] = await Promise.all(
      definitions.map(async info => {
        const uri = await sonataFlowService.fetchWorkflowUri(info.id);
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
      await sonataFlowService.fetchWorkflowDefinition(workflowId);

    if (!definition) {
      res
        .status(500)
        .send(`Couldn't fetch workflow definition for ${workflowId}`);
      return;
    }

    const uri = await sonataFlowService.fetchWorkflowUri(workflowId);
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

    const result = await dataIndexService.abortWorkflowInstance(workflowId);

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

    const definition = await dataIndexService.getWorkflowDefinition(workflowId);
    const serviceUrl = definition.serviceUrl;
    if (!serviceUrl) {
      throw new Error(`ServiceURL is not defined for workflow ${workflowId}`);
    }
    const executionResponse = await sonataFlowService.executeWorkflow({
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
      await sonataFlowService.fetchWorkflowOverview(workflowId);

    if (!overviewObj) {
      res
        .status(500)
        .send(`Couldn't fetch workflow overview for ${workflowId}`);
      return;
    }
    res.status(200).json(overviewObj);
  });

  router.get('/instances', async (_, res) => {
    const instances = await dataIndexService.fetchProcessInstances();

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

    const instance = await dataIndexService.fetchProcessInstance(instanceId);

    if (!instance) {
      res.status(500).send(`Couldn't fetch process instance ${instanceId}`);
      return;
    }

    let assessedByInstance: ProcessInstance | undefined;

    if (!!includeAssessment && instance.businessKey) {
      assessedByInstance = await dataIndexService.fetchProcessInstance(
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

    const jobs = await dataIndexService.fetchProcessInstanceJobs(instanceId);

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
      await dataIndexService.getWorkflowDefinition(workflowId);
    const serviceUrl = workflowDefinition.serviceUrl;
    if (!serviceUrl) {
      throw new Error(`ServiceUrl is not defined for workflow ${workflowId}`);
    }

    // workflow source
    const definition =
      await sonataFlowService.fetchWorkflowDefinition(workflowId);

    if (!definition) {
      res.status(500).send(`Couldn't fetch workflow definition ${workflowId}`);
      return;
    }

    const uri = await sonataFlowService.fetchWorkflowUri(workflowId);

    if (!uri) {
      res.status(500).send(`Couldn't fetch workflow uri ${workflowId}`);
      return;
    }

    const workflowItem: WorkflowItem = { uri, definition };

    const response: WorkflowDataInputSchemaResponse = {
      workflowItem,
      schemas: [],
      initialState: {
        values: [],
        readonlyKeys: [],
      },
    };

    if (!definition.dataInputSchema) {
      res.status(200).json(response);
      return;
    }

    const workflowInfo = await sonataFlowService.fetchWorkflowInfo(
      workflowId,
      serviceUrl,
    );

    if (!workflowInfo) {
      res.status(500).send(`Couldn't fetch workflow info ${workflowId}`);
      return;
    }

    if (!workflowInfo.inputSchema) {
      res
        .status(500)
        .send(`Couldn't fetch workflow input schema ${workflowId}`);
      return;
    }

    const schemas = dataInputSchemaService.parseComposition(
      workflowInfo.inputSchema,
    );

    const instanceVariables = instanceId
      ? await dataIndexService.fetchProcessInstanceVariables(instanceId)
      : undefined;

    const instanceWorkflowData = instanceVariables?.[WORKFLOW_DATA_KEY];
    let initialState: JsonObject[] = [];
    let readonlyKeys: string[] = [];

    if (instanceWorkflowData) {
      initialState = dataInputSchemaService.extractInitialStateFromWorkflowData(
        {
          workflowData: instanceWorkflowData as JsonObject,
          schemas,
        },
      );
    }

    const assessmentInstanceVariables = assessmentInstanceId
      ? await dataIndexService.fetchProcessInstanceVariables(
          assessmentInstanceId,
        )
      : undefined;

    const assessmentInstanceWorkflowData =
      assessmentInstanceVariables?.[WORKFLOW_DATA_KEY];

    if (assessmentInstanceWorkflowData) {
      const assessmentInstanceInitialState =
        dataInputSchemaService.extractInitialStateFromWorkflowData({
          workflowData: assessmentInstanceWorkflowData as JsonObject,
          schemas,
        });

      if (initialState.length === 0) {
        initialState = assessmentInstanceInitialState;
      }

      readonlyKeys = assessmentInstanceInitialState
        .map(item => Object.keys(item).filter(key => item[key] !== undefined))
        .flat();
    }

    response.schemas = schemas;
    response.initialState = {
      values: initialState,
      readonlyKeys,
    };

    res.status(200).json(response);
  });

  router.delete('/workflows/:workflowId', async (req, res) => {
    const workflowId = req.params.workflowId;
    const uri = await sonataFlowService.fetchWorkflowUri(workflowId);

    if (!uri) {
      res.status(500).send(`Couldn't fetch workflow uri ${workflowId}`);
      return;
    }

    await workflowService.deleteWorkflowDefinitionById(uri);
    res.status(200).send();
  });

  router.post('/workflows', async (req, res) => {
    const uri = extractQueryParam(req, QUERY_PARAM_URI);

    if (!uri) {
      res.status(400).send('uri query param is required');
      return;
    }

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

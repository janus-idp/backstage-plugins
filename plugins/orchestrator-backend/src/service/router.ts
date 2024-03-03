import { errorHandler } from '@backstage/backend-common';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { JsonObject, JsonValue } from '@backstage/types';

import { fullFormats } from 'ajv-formats/dist/formats';
import express from 'express';
import Router from 'express-promise-router';
import { OpenAPIBackend, Request } from 'openapi-backend';

import {
  openApiDocument,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_BUSINESS_KEY,
  QUERY_PARAM_INCLUDE_ASSESSMENT,
  QUERY_PARAM_INSTANCE_ID,
  WorkflowInputSchemaResponse,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { RouterArgs } from '../routerWrapper';
import { V1 } from './api/v1';
import { V2 } from './api/v2';
import { CloudEventService } from './CloudEventService';
import { INTERNAL_SERVER_ERROR_MESSAGE } from './constants';
import { DataIndexService } from './DataIndexService';
import { DataInputSchemaService } from './DataInputSchemaService';
import { JiraEvent, JiraService } from './JiraService';
import { ScaffolderService } from './ScaffolderService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowService } from './WorkflowService';

interface Services {
  sonataFlowService: SonataFlowService;
  workflowService: WorkflowService;
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
  const { config, logger, discovery, catalogApi, urlReader } = args;

  const api = initOpenAPIBackend();
  await api.init();

  const router = Router();
  router.use(express.json());
  router.use('/workflows', express.text());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const cloudEventService = new CloudEventService(logger);
  const jiraService = new JiraService(
    logger,
    cloudEventService,
    args.dataIndexService,
  );
  const dataInputSchemaService = new DataInputSchemaService();

  const workflowService = new WorkflowService(
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
    jiraService,
    dataIndexService: args.dataIndexService,
    dataInputSchemaService,
  };

  setupInternalRoutes(router, api, services);
  setupExternalRoutes(router, discovery, scaffolderService);

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
      formats: fullFormats, // open issue: https://github.com/openapistack/openapi-backend/issues/280
    },
    handlers: {
      validationFail: async (
        c,
        _req: express.Request,
        res: express.Response,
      ) => {
        console.log('validationFail', c.operation);
        res.status(400).json({ err: c.validation.errors });
      },
      notFound: async (_c, req: express.Request, res: express.Response) => {
        res.status(404).json({ err: `${req.path} path not found` });
      },
      notImplemented: async (_c, req: express.Request, res: express.Response) =>
        res.status(500).json({ err: `${req.path} not implemented` }),
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
  router.get('/workflows/overview', async (_c, res) => {
    await V1.getWorkflowsOverview(services.sonataFlowService)
      .then(result => res.status(200).json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  api.register(
    'getWorkflowsOverview',
    async (_c, _req, res: express.Response, next) => {
      await V2.getWorkflowsOverview(services.sonataFlowService)
        .then(result => res.json(result))
        .catch(error => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  router.get('/workflows/:workflowId', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    await V1.getWorkflowById(services.sonataFlowService, workflowId)
      .then(result => res.status(200).json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  api.register('getWorkflowById', async (c, _req, res, next) => {
    const workflowId = c.request.params.workflowId as string;

    await V2.getWorkflowById(services.sonataFlowService, workflowId)
      .then(result => res.json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        next();
      });
  });

  router.get('/workflows/:workflowId/source', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    await V1.getWorkflowSourceById(services.sonataFlowService, workflowId)
      .then(result => res.status(200).send(result))
      .catch(error => {
        res.status(500).send(error.message || INTERNAL_SERVER_ERROR_MESSAGE);
      });
  });

  // v2
  api.register('getWorkflowSourceById', async (c, _req, res, next) => {
    const workflowId = c.request.params.workflowId as string;

    await V2.getWorkflowSourceById(services.sonataFlowService, workflowId)
      .then(result => res.send(result))
      .catch(error => {
        res.status(500).send(error.message || INTERNAL_SERVER_ERROR_MESSAGE);
        next();
      });
  });

  router.delete('/workflows/:workflowId/abort', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    await V1.abortWorkflow(services.dataIndexService, workflowId)
      .then(result => res.status(200).json(result.data))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  api.register('abortWorkflow', async (c, _req, res, next) => {
    const workflowId = c.request.params.workflowId as string;
    await V2.abortWorkflow(services.dataIndexService, workflowId)
      .then(result => res.json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        next();
      });
  });

  router.post('/workflows/:workflowId/execute', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const businessKey = V1.extractQueryParam(req, QUERY_PARAM_BUSINESS_KEY);

    await V1.executeWorkflow(
      services.dataIndexService,
      services.sonataFlowService,
      req.body,
      workflowId,
      businessKey,
    )
      .then((result: any) => res.status(200).json(result))
      .catch((error: { message: any }) => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  api.register(
    'executeWorkflow',
    async (c, req: express.Request, res: express.Response) => {
      const workflowId = c.request.params.workflowId as string;
      const businessKey = V2.extractQueryParam(
        c.request,
        QUERY_PARAM_BUSINESS_KEY,
      );

      const executeWorkflowRequestDTO = req.body;
      await V2.executeWorkflow(
        services.dataIndexService,
        services.sonataFlowService,
        executeWorkflowRequestDTO,
        workflowId,
        businessKey,
      )
        .then(result => res.status(200).json(result))
        .catch((error: { message: string }) => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        });
    },
  );

  // v2
  api.register(
    'executeWorkflow',
    async (c, req: express.Request, res: express.Response) => {
      const workflowId = c.request.params.workflowId as string;
      const businessKey = V2.extractQueryParam(
        c.request,
        QUERY_PARAM_BUSINESS_KEY,
      );

      const executeWorkflowRequestDTO = req.body;
      await V2.executeWorkflow(
        services.dataIndexService,
        services.sonataFlowService,
        executeWorkflowRequestDTO,
        workflowId,
        businessKey,
      )
        .then(result => res.status(200).json(result))
        .catch((error: { message: string }) => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        });
    },
  );

  router.get('/workflows/:workflowId/overview', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    await V1.getWorkflowOverviewById(
      services.sonataFlowService,
      workflowId,
    ).then(result => res.json(result));
  });

  // v2
  api.register(
    'getWorkflowOverviewById',
    async (c, _req: express.Request, res: express.Response, next) => {
      const workflowId = c.request.params.workflowId as string;

      await V2.getWorkflowOverviewById(services.sonataFlowService, workflowId)
        .then(result => res.json(result))
        .catch(next);
    },
  );

  router.get('/instances', async (_, res) => {
    await V1.getInstances(services.dataIndexService)
      .then(result => res.status(200).json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  api.register(
    'getInstances',
    async (_c, _req: express.Request, res: express.Response, next) => {
      await V2.getInstances(services.dataIndexService)
        .then(result => res.json(result))
        .catch(next);
    },
  );

  router.get('/instances/:instanceId', async (req, res) => {
    const {
      params: { instanceId },
    } = req;

    const includeAssessment = V1.extractQueryParam(
      req,
      QUERY_PARAM_INCLUDE_ASSESSMENT,
    );

    await V1.getInstanceById(
      services.dataIndexService,
      instanceId,
      includeAssessment,
    )
      .then(result => res.status(200).json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  api.register(
    'getInstanceById',
    async (c, _req: express.Request, res: express.Response, next) => {
      const instanceId = c.request.params.instanceId as string;
      const includeAssessment = V2.extractQueryParam(
        c.request,
        QUERY_PARAM_INCLUDE_ASSESSMENT,
      );
      await V2.getInstanceById(
        services.dataIndexService,
        instanceId,
        includeAssessment,
      )
        .then(result => res.status(200).json(result))
        .catch(error => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  router.get('/workflows/:workflowId/inputSchema', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const instanceId = V1.extractQueryParam(req, QUERY_PARAM_INSTANCE_ID);
    const assessmentInstanceId = V1.extractQueryParam(
      req,
      QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
    );

    const workflowDefinition =
      await services.dataIndexService.getWorkflowDefinition(workflowId);

    if (!workflowDefinition) {
      res.status(500).send(`Couldn't fetch workflow definition ${workflowId}`);
      return;
    }
    const serviceUrl = workflowDefinition.serviceUrl;
    if (!serviceUrl) {
      res
        .status(500)
        .send(`Service URL is not defined for workflow ${workflowId}`);
      return;
    }

    // workflow source
    const definition =
      await services.sonataFlowService.fetchWorkflowDefinition(workflowId);

    if (!definition) {
      res.status(500).send(`Couldn't fetch workflow definition ${workflowId}`);
      return;
    }

    const response: WorkflowInputSchemaResponse = {
      definition,
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
          definition,
          workflowInfo.inputSchema,
          instanceVariables,
          assessmentInstanceVariables,
        ),
      );
  });

  router.post('/webhook/jira', async (req, res) => {
    const event = req.body as JiraEvent;
    await services.jiraService.handleEvent(event);
    res.status(200).send();
  });

  // v2
  api.register(
    'getWorkflowResults',
    async (c, _req: express.Request, res: express.Response) => {
      const instanceId = c.request.params.instanceId as string;

      await V2.getWorkflowResults(services.dataIndexService, instanceId)
        .then(result => res.status(200).json(result))
        .catch((error: { message: string }) => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        });
    },
  );

  // v2
  api.register(
    'getWorkflowStatuses',
    async (_c, _req: express.Request, res: express.Response) => {
      await V2.getWorkflowStatuses()
        .then(result => res.status(200).json(result))
        .catch((error: { message: string }) => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        });
    },
  );
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

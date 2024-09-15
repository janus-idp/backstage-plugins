import {
  createLegacyAuthAdapters,
  errorHandler,
  resolvePackagePath,
} from '@backstage/backend-common';
import {
  HttpAuthService,
  PermissionsService,
} from '@backstage/backend-plugin-api';
import { PluginTaskScheduler } from '@backstage/backend-tasks';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { NotAllowedError } from '@backstage/errors';
import {
  AuthorizeResult,
  BasicPermission,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';
import { JsonObject, JsonValue } from '@backstage/types';

import { fullFormats } from 'ajv-formats/dist/formats';
import express from 'express';
import Router from 'express-promise-router';
import { Request as HttpRequest } from 'express-serve-static-core';
import { OpenAPIBackend, Request } from 'openapi-backend';
import { Logger } from 'winston';

import {
  openApiDocument,
  orchestratorPermissions,
  orchestratorWorkflowExecutePermission,
  orchestratorWorkflowInstanceAbortPermission,
  orchestratorWorkflowInstanceReadPermission,
  orchestratorWorkflowInstancesReadPermission,
  orchestratorWorkflowReadPermission,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  QUERY_PARAM_BUSINESS_KEY,
  QUERY_PARAM_INCLUDE_ASSESSMENT,
  QUERY_PARAM_INSTANCE_ID,
  WorkflowInputSchemaResponse,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import * as pkg from '../../package.json';
import { RouterArgs } from '../routerWrapper';
import { buildPagination } from '../types/pagination';
import { V1 } from './api/v1';
import { V2 } from './api/v2';
import { CloudEventService } from './CloudEventService';
import { INTERNAL_SERVER_ERROR_MESSAGE } from './constants';
import { DataIndexService } from './DataIndexService';
import { DataInputSchemaService } from './DataInputSchemaService';
import { JiraEvent, JiraService } from './JiraService';
import { OrchestratorService } from './OrchestratorService';
import { ScaffolderService } from './ScaffolderService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowCacheService } from './WorkflowCacheService';

interface PublicServices {
  jiraService: JiraService;
  dataInputSchemaService: DataInputSchemaService;
  orchestratorService: OrchestratorService;
}

interface RouterApi {
  openApiBackend: OpenAPIBackend;
  v1: V1;
  v2: V2;
}

const authorize = async (
  request: HttpRequest,
  permission: BasicPermission,
  permissionsSvc: PermissionsService,
  httpAuth: HttpAuthService,
) => {
  const decision = (
    await permissionsSvc.authorize([{ permission: permission }], {
      credentials: await httpAuth.credentials(request),
    })
  )[0];

  return decision;
};

declare class UnauthorizedError extends NotAllowedError {
  message: 'Unauthorized';
}

export async function createBackendRouter(
  args: RouterArgs,
): Promise<express.Router> {
  const {
    config,
    logger,
    discovery,
    catalogApi,
    urlReader,
    scheduler,
    permissions,
  } = args;
  const { httpAuth } = createLegacyAuthAdapters({
    httpAuth: args.httpAuth,
    discovery: args.discovery,
  });
  const publicServices = initPublicServices(logger, config, scheduler);

  const routerApi = await initRouterApi(publicServices.orchestratorService);

  const router = Router();
  const permissionsIntegrationRouter = createPermissionIntegrationRouter({
    permissions: orchestratorPermissions,
  });
  router.use(express.json());
  router.use(permissionsIntegrationRouter);
  router.use('/workflows', express.text());
  router.use('/static', express.static(resolvePackagePath(pkg.name, 'static')));

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const scaffolderService: ScaffolderService = new ScaffolderService(
    logger,
    config,
    catalogApi,
    urlReader,
  );

  setupInternalRoutes(router, publicServices, routerApi, permissions, httpAuth);
  setupExternalRoutes(router, discovery, scaffolderService);

  router.use((req, res, next) => {
    if (!next) {
      throw new Error('next is undefined');
    }

    routerApi.openApiBackend.handleRequest(req as Request, req, res, next);
  });

  router.use(errorHandler());
  return router;
}

function initPublicServices(
  logger: Logger,
  config: Config,
  scheduler: PluginTaskScheduler,
): PublicServices {
  const dataIndexUrl = config.getString('orchestrator.dataIndexService.url');
  const dataIndexService = new DataIndexService(dataIndexUrl, logger);
  const sonataFlowService = new SonataFlowService(dataIndexService, logger);

  const workflowCacheService = new WorkflowCacheService(
    logger,
    dataIndexService,
    sonataFlowService,
  );
  workflowCacheService.schedule({ scheduler: scheduler });

  const orchestratorService = new OrchestratorService(
    sonataFlowService,
    dataIndexService,
    workflowCacheService,
  );

  const cloudEventService = new CloudEventService(logger);
  const jiraService = new JiraService(
    logger,
    cloudEventService,
    dataIndexService,
  );
  const dataInputSchemaService = new DataInputSchemaService();

  return {
    orchestratorService,
    jiraService,
    dataInputSchemaService,
  };
}

async function initRouterApi(
  orchestratorService: OrchestratorService,
): Promise<RouterApi> {
  const openApiBackend = new OpenAPIBackend({
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
  await openApiBackend.init();
  const v1 = new V1(orchestratorService);
  const v2 = new V2(orchestratorService, v1);
  return { v1, v2, openApiBackend };
}

// ======================================================
// Internal Backstage API calls to delegate to SonataFlow
// ======================================================
function setupInternalRoutes(
  router: express.Router,
  services: PublicServices,
  routerApi: RouterApi,
  permissions: PermissionsService,
  httpAuth: HttpAuthService,
) {
  // v1
  router.get('/workflows/overview', async (req, res) => {
    const desicion = await authorize(
      req,
      orchestratorWorkflowInstancesReadPermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }
    await routerApi.v1
      .getWorkflowsOverview()
      .then(result => res.status(200).json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowsOverview',
    async (_c, req, res: express.Response, next) => {
      const desicion = await authorize(
        req,
        orchestratorWorkflowInstancesReadPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      await routerApi.v2
        .getWorkflowsOverview(buildPagination(req))
        .then(result => res.json(result))
        .catch(error => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  // v1
  router.get('/workflows/:workflowId', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    const desicion = await authorize(
      req,
      orchestratorWorkflowReadPermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }
    await routerApi.v1
      .getWorkflowById(workflowId)
      .then(result => res.status(200).json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowById',
    async (c, _req, res, next) => {
      const desicion = await authorize(
        _req,
        orchestratorWorkflowReadPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      const workflowId = c.request.params.workflowId as string;
      await routerApi.v2
        .getWorkflowById(workflowId)
        .then(result => res.json(result))
        .catch(error => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  // v1
  router.get('/workflows/:workflowId/source', async (req, res) => {
    const {
      params: { workflowId },
    } = req;
    const desicion = await authorize(
      req,
      orchestratorWorkflowReadPermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }

    try {
      const result = await routerApi.v1.getWorkflowSourceById(workflowId);
      res.status(200).contentType('text/plain').send(result);
    } catch (error) {
      res
        .status(500)
        .contentType('text/plain')
        .send((error as Error)?.message || INTERNAL_SERVER_ERROR_MESSAGE);
    }
  });

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowSourceById',
    async (c, _req, res, next) => {
      const desicion = await authorize(
        _req,
        orchestratorWorkflowReadPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      const workflowId = c.request.params.workflowId as string;

      try {
        const result = await routerApi.v2.getWorkflowSourceById(workflowId);
        res.status(200).contentType('plain/text').send(result);
      } catch (error) {
        res
          .status(500)
          .contentType('plain/text')
          .send((error as Error)?.message || INTERNAL_SERVER_ERROR_MESSAGE);
        next();
      }
    },
  );

  // v1
  router.delete('/instances/:instanceId/abort', async (req, res) => {
    const desicion = await authorize(
      req,
      orchestratorWorkflowInstanceAbortPermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }
    const {
      params: { instanceId },
    } = req;

    try {
      await routerApi.v1.abortWorkflow(instanceId);
      res.status(200).send();
    } catch (error) {
      res
        .status(500)
        .contentType('plain/text')
        .send((error as Error)?.message || INTERNAL_SERVER_ERROR_MESSAGE);
    }
  });

  // v2
  routerApi.openApiBackend.register(
    'abortWorkflow',
    async (c, _req, res, next) => {
      const desicion = await authorize(
        _req,
        orchestratorWorkflowInstanceAbortPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      const instanceId = c.request.params.instanceId as string;
      await routerApi.v2
        .abortWorkflow(instanceId)
        .then(result => res.json(result))
        .catch(error => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  // v1
  router.post('/workflows/:workflowId/execute', async (req, res) => {
    const desicion = await authorize(
      req,
      orchestratorWorkflowExecutePermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }
    const {
      params: { workflowId },
    } = req;

    const businessKey = routerApi.v1.extractQueryParam(
      req,
      QUERY_PARAM_BUSINESS_KEY,
    );

    await routerApi.v1
      .executeWorkflow(req.body, workflowId, businessKey)
      .then(result => res.status(200).json(result))
      .catch((error: { message: string }) => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  routerApi.openApiBackend.register(
    'executeWorkflow',
    async (c, req: express.Request, res: express.Response) => {
      const desicion = await authorize(
        req,
        orchestratorWorkflowExecutePermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      const workflowId = c.request.params.workflowId as string;
      const businessKey = routerApi.v2.extractQueryParam(
        c.request,
        QUERY_PARAM_BUSINESS_KEY,
      );

      const executeWorkflowRequestDTO = req.body;

      await routerApi.v2
        .executeWorkflow(executeWorkflowRequestDTO, workflowId, businessKey)
        .then(result => res.status(200).json(result))
        .catch((error: { message: string }) => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        });
    },
  );

  // v1
  router.get('/workflows/:workflowId/overview', async (req, res) => {
    const desicion = await authorize(
      req,
      orchestratorWorkflowReadPermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }
    const {
      params: { workflowId },
    } = req;
    await routerApi.v1
      .getWorkflowOverviewById(workflowId)
      .then(result => res.json(result));
  });

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowOverviewById',
    async (c, _req: express.Request, res: express.Response, next) => {
      const desicion = await authorize(
        _req,
        orchestratorWorkflowReadPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      const workflowId = c.request.params.workflowId as string;
      await routerApi.v2
        .getWorkflowOverviewById(workflowId)
        .then(result => res.json(result))
        .catch(next);
    },
  );

  // v1
  router.get('/instances', async (req, res) => {
    const desicion = await authorize(
      req,
      orchestratorWorkflowInstancesReadPermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }
    await routerApi.v1
      .getInstances()
      .then(result => res.status(200).json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  routerApi.openApiBackend.register(
    'getInstances',
    async (_c, req: express.Request, res: express.Response, next) => {
      const desicion = await authorize(
        req,
        orchestratorWorkflowInstancesReadPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      await routerApi.v2
        .getInstances(buildPagination(req))
        .then(result => res.json(result))
        .catch(next);
    },
  );

  // v1
  router.get('/instances/:instanceId', async (req, res) => {
    const desicion = await authorize(
      req,
      orchestratorWorkflowInstanceReadPermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }
    const {
      params: { instanceId },
    } = req;

    const includeAssessment = routerApi.v1.extractQueryParam(
      req,
      QUERY_PARAM_INCLUDE_ASSESSMENT,
    );

    await routerApi.v1
      .getInstanceById(instanceId, !!includeAssessment)
      .then(result => res.status(200).json(result))
      .catch(error => {
        res
          .status(500)
          .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
      });
  });

  // v2
  routerApi.openApiBackend.register(
    'getInstanceById',
    async (c, _req: express.Request, res: express.Response, next) => {
      const desicion = await authorize(
        _req,
        orchestratorWorkflowInstanceReadPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      const instanceId = c.request.params.instanceId as string;
      const includeAssessment = routerApi.v2.extractQueryParam(
        c.request,
        QUERY_PARAM_INCLUDE_ASSESSMENT,
      );
      await routerApi.v2
        .getInstanceById(instanceId, !!includeAssessment)
        .then(result => res.status(200).json(result))
        .catch(error => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
          next();
        });
    },
  );

  // v1
  router.get('/workflows/:workflowId/inputSchema', async (req, res) => {
    const desicion = await authorize(
      req,
      orchestratorWorkflowReadPermission,
      permissions,
      httpAuth,
    );
    if (desicion.result === AuthorizeResult.DENY) {
      throw new UnauthorizedError();
    }
    const {
      params: { workflowId },
    } = req;

    const instanceId = routerApi.v1.extractQueryParam(
      req,
      QUERY_PARAM_INSTANCE_ID,
    );
    const assessmentInstanceId = routerApi.v1.extractQueryParam(
      req,
      QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
    );

    const workflowDefinition =
      await services.orchestratorService.fetchWorkflowInfo({
        definitionId: workflowId,
        cacheHandler: 'throw',
      });

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
      await services.orchestratorService.fetchWorkflowDefinition({
        definitionId: workflowId,
        cacheHandler: 'throw',
      });

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

    const workflowInfo =
      await services.orchestratorService.fetchWorkflowInfoOnService({
        definitionId: workflowId,
        serviceUrl,
        cacheHandler: 'throw',
      });

    if (!workflowInfo) {
      res.status(500).send(`couldn't fetch workflow info ${workflowId}`);
      return;
    }

    if (!workflowInfo.inputSchema) {
      res
        .status(500)
        .send(
          `failed to retreive schema ${JSON.stringify(
            definition.dataInputSchema,
          )}`,
        );
      return;
    }

    const instanceVariables = instanceId
      ? await services.orchestratorService.fetchInstanceVariables({
          instanceId,
          cacheHandler: 'throw',
        })
      : undefined;

    const assessmentInstanceVariables = assessmentInstanceId
      ? await services.orchestratorService.fetchInstanceVariables({
          instanceId: assessmentInstanceId,
          cacheHandler: 'throw',
        })
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
  routerApi.openApiBackend.register(
    'getWorkflowResults',
    async (c, _req: express.Request, res: express.Response) => {
      const desicion = await authorize(
        _req,
        orchestratorWorkflowInstanceReadPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      const instanceId = c.request.params.instanceId as string;

      await routerApi.v2
        .getWorkflowResults(instanceId)
        .then(result => res.status(200).json(result))
        .catch((error: { message: string }) => {
          res
            .status(500)
            .json({ message: error.message || INTERNAL_SERVER_ERROR_MESSAGE });
        });
    },
  );

  // v2
  routerApi.openApiBackend.register(
    'getWorkflowStatuses',
    async (_c, _req: express.Request, res: express.Response) => {
      const desicion = await authorize(
        _req,
        orchestratorWorkflowInstanceReadPermission,
        permissions,
        httpAuth,
      );
      if (desicion.result === AuthorizeResult.DENY) {
        throw new UnauthorizedError();
      }
      await routerApi.v2
        .getWorkflowStatuses()
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

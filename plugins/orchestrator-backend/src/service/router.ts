import { errorHandler } from '@backstage/backend-common';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { ScmIntegrations } from '@backstage/integration';
import { JsonObject, JsonValue } from '@backstage/types';

import express from 'express';
import Router from 'express-promise-router';

import {
  fromWorkflowSource,
  orchestrator_service_ready_topic,
  WorkflowDataInputSchema,
  WorkflowDataInputSchemaResponse,
  WorkflowItem,
  WorkflowListResult,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { RouterArgs } from '../routerWrapper';
import { CloudEventService } from './CloudEventService';
import { DataInputSchemaService } from './DataInputSchemaService';
import { JiraEvent, JiraService } from './JiraService';
import { OpenApiService } from './OpenApiService';
import { ScaffolderService } from './ScaffolderService';
import { SonataFlowService } from './SonataFlowService';
import { WorkflowService } from './WorkflowService';

export async function createBackendRouter(
  args: RouterArgs & { sonataFlowService: SonataFlowService },
): Promise<express.Router> {
  const { eventBroker, config, logger, discovery, catalogApi, urlReader } =
    args;

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

  const cloudEventService = new CloudEventService(
    logger,
    args.sonataFlowService.url,
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

  setupInternalRoutes(
    router,
    args.sonataFlowService,
    workflowService,
    openApiService,
    dataInputSchemaService,
    jiraService,
  );
  setupExternalRoutes(router, discovery, scaffolderService);

  await workflowService.reloadWorkflows();

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
  sonataFlowService: SonataFlowService,
  workflowService: WorkflowService,
  openApiService: OpenApiService,
  dataInputSchemaService: DataInputSchemaService,
  jiraService: JiraService,
) {
  router.get('/workflows', async (_, res) => {
    const definitions = await sonataFlowService.fetchWorkflows();

    if (!definitions) {
      res.status(500).send("Couldn't fetch workflows");
      return;
    }

    const result: WorkflowListResult = {
      items: definitions,
      limit: 0,
      offset: 0,
      totalCount: definitions?.length ?? 0,
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

  router.post('/workflows/:workflowId/execute', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

    const executionResponse = await sonataFlowService.executeWorkflow({
      workflowId,
      inputData: req.body,
    });

    if (!executionResponse) {
      res.status(500).send(`Couldn't execute workflow ${workflowId}`);
      return;
    }

    res.status(200).json(executionResponse);
  });

  router.get('/instances', async (_, res) => {
    const instances = await sonataFlowService.fetchProcessInstances();

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
    const instance = await sonataFlowService.fetchProcessInstance(instanceId);

    if (!instance) {
      res.status(500).send(`Couldn't fetch process instance ${instanceId}`);
      return;
    }

    res.status(200).json(instance);
  });

  router.get('/instances/:instanceId/jobs', async (req, res) => {
    const {
      params: { instanceId },
    } = req;

    const jobs = await sonataFlowService.fetchProcessInstanceJobs(instanceId);

    if (!jobs) {
      res.status(500).send(`Couldn't fetch jobs for instance ${instanceId}`);
      return;
    }

    res.status(200).json(jobs);
  });

  router.get('/workflows/:workflowId/schema', async (req, res) => {
    const {
      params: { workflowId },
    } = req;

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

    let schema: WorkflowDataInputSchema | undefined = undefined;

    if (definition.dataInputSchema) {
      const openApi = await sonataFlowService.fetchOpenApi();

      if (!openApi) {
        res.status(500).send(`Couldn't fetch OpenAPI from SonataFlow service`);
        return;
      }

      const workflowDataInputSchema =
        await dataInputSchemaService.resolveDataInputSchema({
          openApi,
          workflowId,
        });

      if (!workflowDataInputSchema) {
        res
          .status(500)
          .send(
            `Couldn't resolve data input schema for workflow ${workflowId}`,
          );
        return;
      }

      schema = workflowDataInputSchema;
    }

    const response: WorkflowDataInputSchemaResponse = {
      workflowItem: workflowItem,
      schema,
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

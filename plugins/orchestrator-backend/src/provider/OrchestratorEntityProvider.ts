import { PluginTaskScheduler } from '@backstage/backend-tasks';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_SOURCE_LOCATION,
  ANNOTATION_VIEW_URL,
  Entity,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { EventParams, EventSubscriber } from '@backstage/plugin-events-node';
import { TemplateEntityV1beta3 } from '@backstage/plugin-scaffolder-common';

import { Logger } from 'winston';

import {
  DEFAULT_CATALOG_ENVIRONMENT,
  DEFAULT_CATALOG_OWNER,
  getWorkflowCategory,
  ORCHESTRATOR_SERVICE_READY_TOPIC,
  WORKFLOW_TYPE,
  WorkflowCategory,
  WorkflowItem,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export class OrchestratorEntityProvider
  implements EntityProvider, EventSubscriber
{
  private connection: EntityProviderConnection | undefined;

  private readonly scheduler: PluginTaskScheduler;
  private readonly logger: Logger;

  private readonly owner: string;
  private readonly environment: string;

  private readonly orchestratorPluginUrl: string;

  static async fromConfig(args: {
    config: Config;
    logger: Logger;
    scheduler: PluginTaskScheduler;
    discovery: DiscoveryApi;
  }): Promise<OrchestratorEntityProvider> {
    const owner =
      args.config.getOptionalString('orchestrator.catalog.owner') ??
      DEFAULT_CATALOG_OWNER;
    const environment =
      args.config.getOptionalString('orchestrator.catalog.environment') ??
      DEFAULT_CATALOG_ENVIRONMENT;

    const orchestratorPluginUrl =
      await args.discovery.getBaseUrl('orchestrator');

    return new OrchestratorEntityProvider({
      orchestratorPluginUrl,
      scheduler: args.scheduler,
      logger: args.logger,
      owner,
      environment,
    });
  }

  constructor(args: {
    orchestratorPluginUrl: string;
    scheduler: PluginTaskScheduler;
    logger: Logger;
    owner: string;
    environment: string;
  }) {
    this.orchestratorPluginUrl = args.orchestratorPluginUrl;
    this.scheduler = args.scheduler;
    this.owner = args.owner;
    this.logger = args.logger;
    this.environment = args.environment;
  }

  getProviderName(): string {
    return OrchestratorEntityProvider.name;
  }

  supportsEventTopics(): string[] {
    return [ORCHESTRATOR_SERVICE_READY_TOPIC];
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;

    this.scheduler.scheduleTask({
      id: `${this.getProviderName()}__task`,
      fn: async () => {
        await this.run();
      },
      frequency: { seconds: 5 },
      timeout: { minutes: 10 },
    });
  }

  async onEvent(params: EventParams): Promise<void> {
    if (params.topic !== ORCHESTRATOR_SERVICE_READY_TOPIC) {
      return;
    }
    await this.run();
  }

  async run() {
    if (!this.connection) {
      return;
    }

    this.logger.info('Retrieving workflow definitions');

    try {
      const svcResponse = await fetch(
        `${this.orchestratorPluginUrl}/workflows`,
      );
      const json = await svcResponse.json();
      const items = json.items as WorkflowItem[];

      const entities: Entity[] = items?.length
        ? this.workflowToTemplateEntities(items)
        : [];

      await this.connection.applyMutation({
        type: 'full',
        entities: entities.map(entity => ({
          entity,
          locationKey: `${this.getProviderName()}:${this.environment}`,
        })),
      });
    } catch (e) {
      this.logger.error('Error retrieving workflow definitions', e);
    }
  }

  private workflowToTemplateEntities(
    items: WorkflowItem[],
  ): TemplateEntityV1beta3[] {
    return items
      .filter(i => i.serviceUrl)
      .map(i => {
        const sanitizedId = i.definition.id.replace(/ /g, '_');
        const category: WorkflowCategory = getWorkflowCategory(i.definition);

        return {
          apiVersion: 'scaffolder.backstage.io/v1beta3',
          kind: 'Template',
          metadata: {
            name: sanitizedId,
            title: i.definition.name,
            description: i.definition.description,
            tags: [category],
            annotations: {
              [ANNOTATION_LOCATION]: `url:${i.serviceUrl}`,
              [ANNOTATION_ORIGIN_LOCATION]: `url:${i.serviceUrl}`,
              [ANNOTATION_SOURCE_LOCATION]: `url:${i.serviceUrl}/management/processes/${sanitizedId}/source`,
              [ANNOTATION_VIEW_URL]: `${i.serviceUrl}/management/processes/${sanitizedId}/source`,
            },
          },
          spec: {
            owner: this.owner,
            type: WORKFLOW_TYPE,
            steps: [],
          },
        };
      });
  }
}

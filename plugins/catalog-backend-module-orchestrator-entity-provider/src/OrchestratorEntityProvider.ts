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
  swf_service_ready_topic,
  SwfItem,
  workflow_type,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export class OrchestratorEntityProvider
  implements EntityProvider, EventSubscriber
{
  private connection: EntityProviderConnection | undefined;

  private readonly scheduler: PluginTaskScheduler;
  private readonly logger: Logger;

  private readonly owner: string;
  private readonly environment: string;

  private readonly kogitoServiceUrl: string;
  private readonly swfPluginUrl: string;

  static async fromConfig(args: {
    config: Config;
    logger: Logger;
    scheduler: PluginTaskScheduler;
    discovery: DiscoveryApi;
  }): Promise<OrchestratorEntityProvider> {
    const kogitoBaseUrl = args.config.getString('swf.baseUrl');
    const kogitoPort = args.config.getNumber('swf.port');
    const owner =
      args.config.getOptionalString('swf.workflowService.owner') ??
      'infrastructure';
    const environment =
      args.config.getOptionalString('swf.workflowService.environment') ??
      'development';

    const swfPluginUrl = await args.discovery.getBaseUrl('swf');
    const kogitoServiceUrl = `${kogitoBaseUrl}:${kogitoPort}`;

    return new OrchestratorEntityProvider({
      kogitoServiceUrl,
      swfPluginUrl,
      scheduler: args.scheduler,
      logger: args.logger,
      owner,
      environment: environment,
    });
  }

  constructor(args: {
    kogitoServiceUrl: string;
    swfPluginUrl: string;
    scheduler: PluginTaskScheduler;
    logger: Logger;
    owner: string;
    environment: string;
  }) {
    this.kogitoServiceUrl = args.kogitoServiceUrl;
    this.swfPluginUrl = args.swfPluginUrl;
    this.scheduler = args.scheduler;
    this.owner = args.owner;
    this.logger = args.logger;
    this.environment = args.environment;
  }

  getProviderName(): string {
    return OrchestratorEntityProvider.name;
  }

  supportsEventTopics(): string[] {
    return [swf_service_ready_topic];
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
    if (params.topic !== swf_service_ready_topic) {
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
      const svcResponse = await fetch(`${this.swfPluginUrl}/items`);
      const json = await svcResponse.json();
      const items = json.items as SwfItem[];

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
    items: SwfItem[],
  ): TemplateEntityV1beta3[] {
    return items.map(i => {
      const sanitizedId = i.definition.id.replace(/ /g, '_');
      return {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: sanitizedId,
          title: i.definition.name,
          description: i.definition.description,
          tags: [workflow_type],
          annotations: {
            [ANNOTATION_LOCATION]: `url:${this.kogitoServiceUrl}`,
            [ANNOTATION_ORIGIN_LOCATION]: `url:${this.kogitoServiceUrl}`,
            [ANNOTATION_SOURCE_LOCATION]: `url:${this.kogitoServiceUrl}/management/processes/${sanitizedId}/source`,
            [ANNOTATION_VIEW_URL]: `${this.kogitoServiceUrl}/management/processes/${sanitizedId}/source`,
          },
        },
        spec: {
          owner: this.owner,
          type: workflow_type,
          steps: [],
        },
      };
    });
  }
}

import type {
  LoggerService,
  SchedulerService,
  SchedulerServiceTaskRunner,
} from '@backstage/backend-plugin-api';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
  ResourceEntity,
} from '@backstage/catalog-model';
import type { Config } from '@backstage/config';
import { InputError, isError, NotFoundError } from '@backstage/errors';
import type {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';

import {
  listJobTemplates,
  listWorkflowJobTemplates,
} from '../clients/AapResourceConnector';
import type { JobTemplate } from '../clients/types';
import { readAapApiEntityConfigs } from './config';
import type { AapConfig } from './types';

export class AapResourceEntityProvider implements EntityProvider {
  private readonly env: string;
  private readonly baseUrl: string;
  private readonly authorization: string;
  private readonly owner: string;
  private readonly system: string;
  private readonly logger: LoggerService;
  private readonly scheduleFn: () => Promise<void>;
  private connection?: EntityProviderConnection;

  static fromConfig(
    deps: {
      config: Config;
      logger: LoggerService;
    },

    options:
      | { schedule: SchedulerServiceTaskRunner }
      | { scheduler: SchedulerService },
  ): AapResourceEntityProvider[] {
    const { config, logger } = deps;

    const providerConfigs = readAapApiEntityConfigs(config);

    return providerConfigs.map(providerConfig => {
      let taskRunner;
      if ('scheduler' in options && providerConfig.schedule) {
        taskRunner = options.scheduler.createScheduledTaskRunner(
          providerConfig.schedule,
        );
      } else if ('schedule' in options) {
        taskRunner = options.schedule;
      } else {
        throw new InputError(
          `No schedule provided via config for AapResourceEntityProvider:${providerConfig.id}.`,
        );
      }

      return new AapResourceEntityProvider(providerConfig, logger, taskRunner);
    });
  }

  private constructor(
    config: AapConfig,
    logger: LoggerService,
    taskRunner: SchedulerServiceTaskRunner,
  ) {
    this.env = config.id;
    this.baseUrl = config.baseUrl;
    this.authorization = config.authorization;
    this.owner = config.owner;
    this.system = config.system ?? '';
    this.logger = logger.child({
      target: this.getProviderName(),
    });

    this.scheduleFn = this.createScheduleFn(taskRunner);
  }

  createScheduleFn(
    taskRunner: SchedulerServiceTaskRunner,
  ): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:run`;
      return taskRunner.run({
        id: taskId,
        fn: async () => {
          try {
            await this.run();
          } catch (error) {
            if (isError(error)) {
              // Ensure that we don't log any sensitive internal data:
              this.logger.error(
                `Error while syncing resources from AAP ${this.baseUrl}`,
                {
                  // Default Error properties:
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                  // Additional status code if available:
                  status: (error.response as { status?: string })?.status,
                },
              );
            }
          }
        },
      });
    };
  }

  getProviderName(): string {
    return `AapResourceEntityProvider:${this.env}`;
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.scheduleFn();
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new NotFoundError('Not initialized');
    }

    this.logger.info(`Discovering ResourceEntities from AAP ${this.baseUrl}`);

    const entities: Entity[] = [];

    const templatesData = await Promise.allSettled([
      listJobTemplates(this.baseUrl, this.authorization),
      listWorkflowJobTemplates(this.baseUrl, this.authorization),
    ]);

    const templates: JobTemplate[] = [];

    templatesData.forEach(results => {
      if (results.status === 'fulfilled') {
        templates.push(...results.value);
      } else if (results.status === 'rejected') {
        // Ensure that we don't log any sensitive internal data:
        const error = results.reason || {};
        this.logger.error('Failed to fetch AAP job templates', {
          // Default Error properties:
          name: error.name,
          message: error.message,
          stack: error.stack,
          // Additional status code if available:
          status: error.response?.status,
        });
      }
    });

    for (const template of templates) {
      const resourceEntity: ResourceEntity =
        this.buildApiEntityFromJobTemplate(template);
      entities.push(resourceEntity);
      this.logger.debug(`Discovered ResourceEntity "${template.name}"`);
    }

    this.logger.info(`Applying the mutation with ${entities.length} entities`);

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
  }

  private buildApiEntityFromJobTemplate(template: JobTemplate): ResourceEntity {
    const templateDetailsUrl = `${this.baseUrl}/#/templates/${template.type}/${template.id}/details`;
    const jobTemplateTransformedName = `${template.name.replace(/ /g, '_')}-${
      template.summary_fields?.organization?.name || template.id
    }-${this.env}`;

    return {
      kind: 'Resource',
      apiVersion: 'backstage.io/v1alpha1',
      metadata: {
        annotations: {
          [ANNOTATION_LOCATION]: this.getProviderName(),
          [ANNOTATION_ORIGIN_LOCATION]: this.getProviderName(),
        },
        name: `${jobTemplateTransformedName}`,
        title: `${template.name}`,
        description: `${template.description}`,
        links: [
          {
            url: `${this.baseUrl}`,
            title: 'AAP Dashboard',
          },
          {
            url: `${templateDetailsUrl}`,
            title: 'Template Details',
          },
        ],
      },
      spec: {
        type: `${template.type}`,
        owner: `${this.owner}`,
        ...(this.system && { system: `${this.system}` }),
      },
    };
  }
}

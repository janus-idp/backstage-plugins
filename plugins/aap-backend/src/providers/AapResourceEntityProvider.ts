import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  Entity,
  ResourceEntity,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';

import { Logger } from 'winston';

import { listJobTemplates } from '../clients/AapResourceConnector';
import { JobTemplate } from '../clients/types';
import { readAapApiEntityConfigs } from './config';
import { AapConfig } from './types';

export class AapResourceEntityProvider implements EntityProvider {
  private readonly env: string;
  private readonly baseUrl: string;
  private readonly authorization: string;
  private readonly owner: string;
  private readonly system: string;
  private readonly logger: Logger;
  private readonly scheduleFn: () => Promise<void>;
  private connection?: EntityProviderConnection;

  static fromConfig(
    configRoot: Config,
    options: {
      logger: Logger;
      schedule?: TaskRunner;
      scheduler?: PluginTaskScheduler;
    },
  ): AapResourceEntityProvider[] {
    const providerConfigs = readAapApiEntityConfigs(configRoot);

    return providerConfigs.map(providerConfig => {
      let taskRunner;
      if (options.schedule) {
        taskRunner = options.schedule;
      } else if (options.scheduler && providerConfig.schedule) {
        taskRunner = options.scheduler.createScheduledTaskRunner(
          providerConfig.schedule,
        );
      } else {
        throw new Error(
          `No schedule provided neither via code nor config for AapResourceEntityProvider:${providerConfig.id}.`,
        );
      }

      return new AapResourceEntityProvider(
        providerConfig,
        options.logger,
        taskRunner,
      );
    });
  }

  private constructor(
    config: AapConfig,
    logger: Logger,
    taskRunner: TaskRunner,
  ) {
    this.env = config.id;
    this.baseUrl = config.baseUrl;
    this.authorization = config.authorization;
    this.owner = config.owner;
    this.system = config.system || '';
    this.logger = logger.child({
      target: this.getProviderName(),
    });

    this.scheduleFn = this.createScheduleFn(taskRunner);
  }

  private createScheduleFn(taskRunner: TaskRunner): () => Promise<void> {
    return async () => {
      const taskId = `${this.getProviderName()}:run`;
      return taskRunner.run({
        id: taskId,
        fn: async () => {
          try {
            await this.run();
          } catch (error) {
            this.logger.error(error);
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
      throw new Error('Not initialized');
    }

    this.logger.info(`Discovering ResourceEntities from AAP ${this.baseUrl}`);

    const entities: Entity[] = [];

    const jobTemplates = await listJobTemplates(
      this.baseUrl,
      this.authorization,
    );

    for (const template of jobTemplates) {
      const resourceEntity: ResourceEntity =
        this.buildApiEntityFromJobTemplate(template);
      entities.push(resourceEntity);
      this.logger.debug(`Discovered ResourceEntity ${template}`);
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
    const templateDetailsUrl = `${this.baseUrl}/#/templates/job_template/${template.id}/details`;
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
        description: `${template.description}`,
        links: [
          {
            url: `${this.baseUrl}`,
            title: 'AAP Dashboard',
          },
          {
            url: `${templateDetailsUrl}`,
            title: 'Job Template Details',
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

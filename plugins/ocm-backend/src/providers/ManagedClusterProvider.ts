/*
 * Copyright 2021 Larder Software Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { PluginTaskScheduler, TaskRunner } from '@backstage/backend-tasks';
import {
  ANNOTATION_LOCATION,
  ANNOTATION_ORIGIN_LOCATION,
  ResourceEntity,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { ANNOTATION_KUBERNETES_API_SERVER } from '@backstage/plugin-kubernetes-common';

import { CustomObjectsApi } from '@kubernetes/client-node';
import * as winston from 'winston';

import {
  ANNOTATION_CLUSTER_ID,
  ANNOTATION_PROVIDER_ID,
} from '@janus-idp/backstage-plugin-ocm-common';

import { CONSOLE_CLAIM, HUB_CLUSTER_NAME_IN_OCM } from '../constants';
import { readOcmConfigs } from '../helpers/config';
import {
  getManagedCluster,
  hubApiClient,
  listManagedClusters,
} from '../helpers/kubernetes';
import { getClaim, translateOCMToResource } from '../helpers/parser';

/**
 * Provides OpenShift cluster resource entities from Open Cluster Management.
 */
export class ManagedClusterProvider implements EntityProvider {
  protected readonly client: CustomObjectsApi;
  protected readonly hubResourceName: string;
  protected readonly id: string;
  protected readonly owner: string;
  protected readonly logger: winston.Logger;
  private readonly scheduleFn: () => Promise<void>;
  protected connection?: EntityProviderConnection;

  protected constructor(
    client: CustomObjectsApi,
    hubResourceName: string,
    id: string,
    options: { logger: winston.Logger },
    owner: string,
    taskRunner: TaskRunner,
  ) {
    this.client = client;
    this.hubResourceName = hubResourceName;
    this.id = id;
    this.logger = options.logger;
    this.owner = owner;
    this.scheduleFn = this.createScheduleFn(taskRunner);
  }

  static fromConfig(
    config: Config,
    options: {
      logger: winston.Logger;
      schedule?: TaskRunner;
      scheduler?: PluginTaskScheduler;
    },
  ) {
    return readOcmConfigs(config).map(provider => {
      const client = hubApiClient(provider, options.logger);
      let taskRunner;
      if (options.scheduler && provider.schedule) {
        // Create a scheduled task runner using the provided scheduler and schedule configuration
        taskRunner = options.scheduler.createScheduledTaskRunner(
          provider.schedule,
        );
      } else if (options.schedule) {
        // Use the provided schedule directly
        taskRunner = options.schedule;
      } else {
        throw new Error(
          `No schedule provided neither via code nor config for "${provider.id}" hub.`,
        );
      }

      return new ManagedClusterProvider(
        client,
        provider.hubResourceName,
        provider.id,
        options,
        provider.owner,
        taskRunner,
      );
    });
  }
  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.scheduleFn();
  }

  private createScheduleFn(taskRunner: TaskRunner): () => Promise<void> {
    return async () => {
      return taskRunner.run({
        id: `run_ocm_refresh_${this.getProviderName()}`,
        fn: async () => {
          try {
            await this.run();
          } catch (error: any) {
            // Ensure that we don't log any sensitive internal data:
            this.logger.error(
              'Error while syncing cluster resources from Open Cluster Management',
              {
                // Default Error properties:
                name: error.name,
                message: error.message,
                stack: error.stack,
                // Additional status code if available:
                status: error.response?.status,
              },
            );
          }
        },
      });
    };
  }

  getProviderName(): string {
    return `ocm-managed-cluster:${this.id}`;
  }

  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    this.logger.info(
      `Providing OpenShift cluster resources from Open Cluster Management`,
    );
    const hubConsole = getClaim(
      await getManagedCluster(this.client, HUB_CLUSTER_NAME_IN_OCM),
      CONSOLE_CLAIM,
    );

    const resources: ResourceEntity[] = (
      await listManagedClusters(this.client)
    ).items.map(i => {
      const normalizedName = translateOCMToResource(
        i.metadata!.name!,
        this.hubResourceName,
      );

      return {
        kind: 'Resource',
        apiVersion: 'backstage.io/v1beta1',
        metadata: {
          name: normalizedName,
          annotations: {
            /**
             * Can also be pulled from ManagedClusterInfo on .spec.masterEndpoint (details in discussion: https://github.com/janus-idp/backstage-plugins/pull/94#discussion_r1093228858)
             */
            [ANNOTATION_KUBERNETES_API_SERVER]:
              i.spec?.managedClusterClientConfigs?.[0]?.url,
            [ANNOTATION_CLUSTER_ID]: i.metadata?.labels?.clusterID!,
            [ANNOTATION_LOCATION]: this.getProviderName(),
            [ANNOTATION_ORIGIN_LOCATION]: this.getProviderName(),
            [ANNOTATION_PROVIDER_ID]: this.id,
          },
          links: [
            {
              url: getClaim(i, CONSOLE_CLAIM),
              title: 'OpenShift Console',
              icon: 'dashboard',
            },
            {
              url: `${hubConsole}/multicloud/infrastructure/clusters/details/${
                i.metadata!.name
              }/`,
              title: 'OCM Console',
            },
            {
              url: `https://console.redhat.com/openshift/details/s/${
                i.metadata!.labels!.clusterID
              }`,
              title: 'OpenShift Cluster Manager',
            },
          ],
        },
        spec: {
          owner: this.owner,
          type: 'kubernetes-cluster',
        },
      };
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: resources.map(entity => ({
        entity,
        locationKey: this.getProviderName(),
      })),
    });
  }
}

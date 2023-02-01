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

import { ResourceEntity } from '@backstage/catalog-model';
import * as winston from 'winston';
import { Config } from '@backstage/config';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  ANNOTATION_ORIGIN_LOCATION,
  ANNOTATION_LOCATION,
  ANNOTATION_KUBERNETES_API_SERVER,
} from '@backstage/catalog-model';
import { CustomObjectsApi } from '@kubernetes/client-node';
import {
  getManagedCluster,
  getManagedClusters,
  hubApiClient,
} from '../helpers/kubernetes';
import { CONSOLE_CLAIM, HUB_CLUSTER_NAME_IN_OCM } from '../constants';
import { getClaim } from '../helpers/parser';
import { getHubClusterName } from '../helpers/config';

/**
 * Provides OpenShift cluster resource entities from Open Cluster Management.
 */
export class ManagedClusterProvider implements EntityProvider {
  protected readonly client: CustomObjectsApi;
  protected readonly hubName: string;
  protected readonly logger: winston.Logger;
  protected connection?: EntityProviderConnection;

  protected constructor(
    client: CustomObjectsApi,
    hubName: string,
    options: { logger: winston.Logger },
  ) {
    this.client = client;
    this.hubName = hubName;
    this.logger = options.logger;
  }

  static fromConfig(config: Config, options: { logger: winston.Logger }) {
    const client = hubApiClient(config, options.logger);
    const hubName = getHubClusterName(config);

    return new ManagedClusterProvider(client, hubName, options);
  }
  public async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }

  getProviderName(): string {
    return 'ocm-managed-cluster';
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
      (await getManagedClusters(this.client)) as { items: Array<any> }
    ).items.map(i => {
      return {
        kind: 'Resource',
        apiVersion: 'backstage.io/v1beta1',
        metadata: {
          name: i.metadata.name,
          title: i.metadata?.labels?.name,
          annotations: {
            /**
             * Can also be pulled from ManagedClusterInfo on .spec.masterEndpoint (details in discussion: https://github.com/janus-idp/backstage-plugins/pull/94#discussion_r1093228858)
             */
            [ANNOTATION_KUBERNETES_API_SERVER]:
              i.spec?.managedClusterClientConfigs?.[0]?.url,
            [ANNOTATION_LOCATION]: `${this.getProviderName()}:${this.hubName}`,
            [ANNOTATION_ORIGIN_LOCATION]: `${this.getProviderName()}:${
              this.hubName
            }`,
          },
          links: [
            {
              url: getClaim(i, CONSOLE_CLAIM),
              title: 'OpenShift Console',
              icon: 'dashboard',
            },
            {
              url: `${hubConsole}/multicloud/infrastructure/clusters/details/${i.metadata.name}/`,
              title: 'OCM Console',
            },
            i.metadata?.labels?.clusterID && {
              url: `https://console.redhat.com/openshift/details/s/${i.metadata.labels.clusterID}`,
              title: 'OpenShift Cluster Manager',
            },
          ],
        },
        spec: {
          owner: 'unknown',
          type: 'kubernetes-cluster',
        },
      };
    });

    await this.connection.applyMutation({
      type: 'full',
      entities: resources.map(entity => ({
        entity,
        locationKey: 'ocm-managed-cluster',
      })),
    });
  }
}

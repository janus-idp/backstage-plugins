/*
 * Copyright 2020 The Backstage Authors
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

import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import {
  getManagedCluster,
  listManagedClusters,
  getManagedClusterInfo,
  hubApiClient,
  listManagedClusterInfos,
} from '../helpers/kubernetes';
import {
  getClaim,
  parseClusterStatus,
  parseManagedCluster,
  parseNodeStatus,
  parseUpdateInfo,
  translateOCMToResource,
  translateResourceToOCM,
} from '../helpers/parser';
import { readOcmConfigs } from '../helpers/config';
import {
  Cluster,
  ClusterOverview,
} from '@janus-idp/backstage-plugin-ocm-common';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  const clients = Object.fromEntries(
    readOcmConfigs(config).map(provider => [
      provider.id,
      {
        client: hubApiClient(provider, options.logger),
        hubResourceName: provider.hubResourceName,
      },
    ]),
  );

  const router = Router();
  router.use(express.json());

  router.get(
    '/status/:providerId/:clusterName',
    async ({ params: { clusterName, providerId } }, response) => {
      logger.debug(
        `Incoming status request for ${clusterName} cluster on ${providerId} hub`,
      );

      if (!clients.hasOwnProperty(providerId)) {
        throw Object.assign(new Error('Hub not found'), {
          statusCode: 404,
          name: 'HubNotFound',
        });
      }

      const normalizedClusterName = translateResourceToOCM(
        clusterName,
        clients[providerId].hubResourceName,
      );

      const mc = await getManagedCluster(
        clients[providerId].client,
        normalizedClusterName,
      );
      const mci = await getManagedClusterInfo(
        clients[providerId].client,
        normalizedClusterName,
      );

      response.send({
        name: clusterName,
        ...parseManagedCluster(mc),
        ...parseUpdateInfo(mci),
      } as Cluster);
    },
  );

  router.get('/status', async (_, response) => {
    logger.debug(`Incoming status request for all clusters`);

    const allClusters = await Promise.all(
      Object.values(clients).map(async c => {
        const mcs = await listManagedClusters(c.client);
        const mcis = await listManagedClusterInfos(c.client);

        return mcs.items.map(
          (mc, index) =>
            ({
              name: translateOCMToResource(
                mc.metadata!.name!,
                c.hubResourceName,
              ),
              status: parseClusterStatus(mc),
              platform: getClaim(mc, 'platform.open-cluster-management.io'),
              openshiftVersion:
                mc.metadata!.labels?.openshiftVersion ||
                getClaim(mc, 'version.openshift.io'),
              nodes: parseNodeStatus(mcis.items[index]),
              ...parseUpdateInfo(mcis.items[index]),
            } as ClusterOverview),
        );
      }),
    );

    return response.send(allClusters.flat());
  });

  router.use(errorHandler({ logClientErrors: true }));

  return router;
}

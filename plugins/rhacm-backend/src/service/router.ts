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
import { StatusCheck } from '../statusCheck/StatusCheck';
import { ClusterDetails } from '../types/types';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  const unavailableCluster: ClusterDetails = {
    status: {
      available: false,
      reason: 'ACM cluster unreachable'
    }
  }

  const statusCheck = new StatusCheck(config, logger);

  const router = Router();
  router.use(express.json());

  router.get('/status/:clusterName', ({ params: { clusterName }}, response) => {
    logger.info(`Incoming status request for ${clusterName} cluster`)
    statusCheck.getClusterStatus(clusterName)
      .then((resp) => {
        response.send(statusCheck.parseStatusCheck(resp.body))
      })
      .catch((resp) => {
        logger.warn(resp);
        response.send(unavailableCluster);
      })
  });

  router.get('/status', (_, response) => {
    logger.info(`Incoming status request for all clusters`)
    statusCheck.getAllClustersStatus()
      .then((resp) => {
        const parsedClusters: Array<ClusterDetails> = resp.body.items
          .map((cluster: any) => (
            statusCheck.parseStatusCheck(cluster)
          ))
        response.send(parsedClusters)
      })
      .catch((resp) => {
        logger.warn(resp);
        response.send([unavailableCluster]);
      })
  });
  router.use(errorHandler());
  return router;
}

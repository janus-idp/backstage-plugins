import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import type { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import express from 'express';

import { KialiApiImpl } from '../clients/KialiAPIConnector';
import { readKialiConfigs } from './config';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  logger.info('Initializing Kiali backend');

  const kiali = readKialiConfigs(config);

  const kialiAPI = new KialiApiImpl({ logger, kiali });

  const router = express.Router();
  router.use(express.json());

  // curl -H "Content-type: application/json" -H "Accept: application/json" -X GET localhost:7007/api/kiali/proxy --data '{"endpoint": "api/namespaces"}'
  router.post('/proxy', async (req, res) => {
    const endpoint = req.body.endpoint;
    logger.info(`Call to Kiali ${endpoint}`);

    kialiAPI.proxy(endpoint).then((response: any) => {
      if (endpoint.includes('api/status')) {
        // Include kiali external url to status
        response.status.kialiExternalUrl = kiali.urlExternal;
      }
      res.json(response);
    });
  });

  router.post('/status', async (_, res) => {
    logger.info(`Call to Kiali Status`);
    res.json(await kialiAPI.status());
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}

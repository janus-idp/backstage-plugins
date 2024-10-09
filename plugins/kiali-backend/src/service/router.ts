import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import express from 'express';

import { KialiApiImpl } from '../clients/KialiAPIConnector';
import { readKialiConfigs } from './config';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export const makeRouter = (
  logger: LoggerService,
  kialiAPI: KialiApiImpl,
): express.Router => {
  const router = express.Router();
  router.use(express.json());

  // curl -H "Content-type: application/json" -H "Accept: application/json" -X GET localhost:7007/api/kiali/proxy --data '{"endpoint": "api/namespaces"}'
  router.post('/proxy', async (req, res) => {
    const endpoint = req.body.endpoint;
    logger.info(`Call to Kiali ${endpoint}`);
    res.json(await kialiAPI.proxy(endpoint));
  });

  router.post('/status', async (_, res) => {
    logger.info(`Call to Kiali Status`);
    res.json(await kialiAPI.status());
  });

  router.use(errorHandler());
  return router;
};

/** @public */
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;
  const { config } = options;

  logger.info('Initializing Kiali backend');

  const kiali = readKialiConfigs(config);

  const kialiAPI = new KialiApiImpl({ logger, kiali });

  return makeRouter(logger, kialiAPI);
}

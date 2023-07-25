import { errorHandler } from '@backstage/backend-common';
import { Config } from '@backstage/config';

import express from 'express';
import { Logger } from 'winston';

import {
  DurationInSeconds,
  KUBERNETES_ANNOTATION,
  KUBERNETES_LABEL_SELECTOR,
  KUBERNETES_NAMESPACE,
  readKialiConfigs,
} from '@janus-idp/backstage-plugin-kiali-common';

import { KialiApiImpl } from '../clients/KialiAPIConnector';

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export type OverviewQuery = {
  ns?: string;
  nss?: string[];
  overviewType?: string;
  duration?: DurationInSeconds;
  direction?: string;
  annotation?: { [key: string]: string };
};

export const makeRouter = (
  logger: Logger,
  kialiAPI: KialiApiImpl,
): express.Router => {
  const getAnnotations = (query: any): { [key: string]: string } => {
    const annotation: { [key: string]: string } = {};
    annotation[KUBERNETES_ANNOTATION] =
      query[encodeURIComponent(KUBERNETES_ANNOTATION)];
    annotation[KUBERNETES_LABEL_SELECTOR] =
      query[encodeURIComponent(KUBERNETES_LABEL_SELECTOR)];
    annotation[KUBERNETES_NAMESPACE] =
      query[encodeURIComponent(KUBERNETES_NAMESPACE)];
    return annotation;
  };
  const router = express.Router();
  router.use(express.json());

  router.get('/config', async (_, res) => {
    logger.debug('Call to Configuration');
    const response = await kialiAPI.fetchConfig();
    res.json(response);
  });

  router.get('/overview', async (req, res) => {
    const query: OverviewQuery = {
      annotation: getAnnotations(req.query),
      duration: Number(req.query.duration) || 600,
      direction: (req.query.direction as string) || 'inbound',
      overviewType: (req.query.overviewType as string) || 'app',
    };
    logger.debug('Call to Overview');
    const response = await kialiAPI.fetchOverviewNamespaces(query);
    res.json(response);
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

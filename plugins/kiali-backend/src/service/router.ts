import { errorHandler } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import {
  CompoundEntityRef,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { InputError } from '@backstage/errors';
import { getBearerTokenFromAuthorizationHeader } from '@backstage/plugin-auth-node';

import express, { Request } from 'express';
import { Logger } from 'winston';

import { readKialiConfigs } from '@janus-idp/backstage-plugin-kiali-common';

import { KialiApiImpl } from '../clients/KialiAPIConnector';

export interface RouterOptions {
  logger: Logger;
  config: Config;
  catalogApi: CatalogApi;
}

export type OverviewQuery = {
  ns?: string;
  nss?: string[];
  overviewType?: string;
  duration?: number;
  direction?: string;
};

export const makeRouter = (
  logger: Logger,
  kialiAPI: KialiApiImpl,
  catalogApi: CatalogApi,
): express.Router => {
  const getEntityByReq = async (req: Request<any>) => {
    const rawEntityRef = req.body.entityRef;
    if (rawEntityRef && typeof rawEntityRef !== 'string') {
      throw new InputError(`entity query must be a string`);
    } else if (!rawEntityRef) {
      throw new InputError('entity is a required field');
    }
    let entityRef: CompoundEntityRef | undefined = undefined;

    try {
      entityRef = parseEntityRef(rawEntityRef);
    } catch (error) {
      throw new InputError(`Invalid entity ref, ${error}`);
    }

    logger.info(`entityRef: ${JSON.stringify(entityRef)}`);

    const token =
      getBearerTokenFromAuthorizationHeader(req.headers.authorization) ||
      (req.cookies?.token as string | undefined);

    logger.info(`Token: ${JSON.stringify(token)}`);
    const entity = await catalogApi.getEntityByRef(entityRef, {
      token: token,
    });

    if (!entity) {
      throw new InputError(
        `Entity ref missing, ${stringifyEntityRef(entityRef)}`,
      );
    }
    return entity;
  };

  const router = express.Router();
  router.use(express.json());

  router.post('/info', async (_, res) => {
    logger.debug('Call to Kiali information');
    const response = await kialiAPI.fetchInfo();
    res.json(response);
  });

  router.post('/config', async (_, res) => {
    logger.debug('Call to Configuration');
    const response = await kialiAPI.fetchConfig();
    res.json(response);
  });

  router.post('/overview', async (req, res) => {
    const entity = await getEntityByReq(req);
    const query: OverviewQuery = {
      duration: Number(req.body.query.duration) || 600,
      direction: (req.body.query.direction as string) || 'inbound',
      overviewType: (req.body.query.overviewType as string) || 'app',
    };
    logger.debug('Call to Overview');
    const response = await kialiAPI.fetchOverviewNamespaces(entity, query);
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
  const { catalogApi } = options;

  logger.info('Initializing Kiali backend');

  const kiali = readKialiConfigs(config);

  const kialiAPI = new KialiApiImpl({ logger, kiali });

  return makeRouter(logger, kialiAPI, catalogApi);
}

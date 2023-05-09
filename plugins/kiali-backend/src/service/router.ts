import { errorHandler } from '@backstage/backend-common';
import { CatalogApi } from '@backstage/catalog-client';
import {
  CompoundEntityRef,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import { Config } from '@backstage/config';
import { AuthenticationError, InputError } from '@backstage/errors';
import { getBearerTokenFromAuthorizationHeader } from '@backstage/plugin-auth-node';

import express, { Request } from 'express';
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
  catalog?: CatalogApi;
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
  catalog?: CatalogApi,
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

    const token = getBearerTokenFromAuthorizationHeader(
      req.headers.authorization,
    );

    if (!token) {
      throw new AuthenticationError('No Backstage token');
    }

    const entity = catalog
      ? await catalog.getEntityByRef(entityRef, {
          token: token,
        })
      : undefined;

    if (!entity) {
      throw new InputError(
        `Entity ref missing, ${stringifyEntityRef(entityRef)}`,
      );
    }
    return entity;
  };
  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  /* Get configuration */
  router.get('/config', async (_, res) => {
    logger.debug('Call to Configuration');
    const response = await kialiAPI.fetchConfig();
    res.json(response);
  });
  /*
  Namespaces filtered by annotations by queryparam:
    example backstage.io/kubernetes-id=travels,backstage.io/namespace=travel-agency
  */
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
  const { catalog } = options;

  logger.info('Initializing Kiali backend');

  const kiali = readKialiConfigs(config);

  const kialiAPI = new KialiApiImpl({ logger, kiali });

  return makeRouter(logger, kialiAPI, catalog);
}

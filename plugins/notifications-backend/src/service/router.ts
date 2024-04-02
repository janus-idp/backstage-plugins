import { CatalogClient } from '@backstage/catalog-client';

import { fullFormats } from 'ajv-formats/dist/formats';
import express from 'express';
import Router from 'express-promise-router';
import { Context, OpenAPIBackend, Request } from 'openapi-backend';

import { Paths } from '../openapi';
import { openApiDocument } from '../openapidocument';
import { checkUserPermission } from './auth';
import { initDB } from './db';
import {
  createNotification,
  getNotifications,
  getNotificationsCount,
  setRead,
} from './handlers';
import {
  notificationsCreatePermission,
  notificationsReadPermission,
  notificationsSetReadPermission,
} from './permissions';
import { RouterOptions } from './types';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, database, discovery, config } = options;

  // workaround for creating the database when client is not sqlite
  const existingDbClient = await database.getClient();
  existingDbClient.destroy();

  const catalogClient = new CatalogClient({ discoveryApi: discovery });
  const dbConfig = config.getConfig('backend.database');

  // create DB client and tables
  if (!dbConfig) {
    logger.error('Missing dbConfig');
    throw new Error('Missing database config');
  }

  const dbClient = await initDB(dbConfig);

  // create openapi requests handler
  const api = new OpenAPIBackend({
    ajvOpts: {
      formats: fullFormats, // open issue: https://github.com/openapistack/openapi-backend/issues/280
    },
    validate: true,
    definition: openApiDocument,
  });

  await api.init();

  api.register(
    'createNotification',
    (
      c: Context<Paths.CreateNotification.RequestBody>,
      req: express.Request,
      res: express.Response,
    ) =>
      checkUserPermission(req, options, notificationsCreatePermission).then(
        () =>
          createNotification(
            dbClient,
            catalogClient,
            c.request.requestBody,
          ).then(result => res.json(result)),
      ),
  );

  api.register(
    'getNotifications',
    (c, req: express.Request, res: express.Response) =>
      checkUserPermission(req, options, notificationsReadPermission).then(
        loggedInUser => {
          const q: Paths.GetNotifications.QueryParameters = Object.assign(
            {},
            c.request.query,
          );
          // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
          q.pageNumber = stringToNumber(q.pageNumber);
          q.pageSize = stringToNumber(q.pageSize);
          q.read = stringToBool(q.read);

          return getNotifications(
            dbClient,
            loggedInUser,
            catalogClient,
            q,
            q.pageSize,
            q.pageNumber,
            q,
          ).then(notifications => res.json(notifications));
        },
      ),
  );

  api.register(
    'getNotificationsCount',
    (c, req: express.Request, res: express.Response) =>
      checkUserPermission(req, options, notificationsReadPermission).then(
        loggedInUser => {
          const q: Paths.GetNotificationsCount.QueryParameters = Object.assign(
            {},
            c.request.query,
          );

          // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
          q.read = q.read = stringToBool(q.read);

          return getNotificationsCount(
            dbClient,
            loggedInUser,
            catalogClient,
            q,
          ).then(result => res.json(result));
        },
      ),
  );

  api.register('setRead', (c, req: express.Request, res: express.Response) =>
    checkUserPermission(req, options, notificationsSetReadPermission).then(
      loggedInUser => {
        const messageId = c.request.query.messageId.toString();
        const read = c.request.query.read.toString() === 'true';

        return setRead(dbClient, loggedInUser, messageId, read).then(result =>
          res.json(result),
        );
      },
    ),
  );

  // create router
  const router = Router();
  router.use(express.json());
  router.use((req, res, next) => {
    if (!next) {
      throw new Error('next is undefined');
    }
    const validation = api.validateRequest(req as Request);
    if (!validation.valid) {
      res.status(500).json({ status: 500, err: validation.errors });
      return;
    }

    api.handleRequest(req as Request, req, res).catch(next);
  });

  return router;
}

function stringToNumber(s: number | undefined): number | undefined {
  return s ? Number.parseInt(s.toString(), 10) : undefined;
}

function stringToBool(s: boolean | undefined): boolean | undefined {
  if (!s) {
    return undefined;
  }

  return s.toString() === 'true' ? true : false;
}

import { CatalogClient } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { NotAllowedError } from '@backstage/errors';
import {
  getBearerTokenFromAuthorizationHeader,
  IdentityApi,
} from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  BasicPermission,
  PermissionEvaluator,
} from '@backstage/plugin-permission-common';
import { createPermissionIntegrationRouter } from '@backstage/plugin-permission-node';

import { fullFormats } from 'ajv-formats/dist/formats';
import express from 'express';
import Router from 'express-promise-router';
import { Context, OpenAPIBackend, Request } from 'openapi-backend';
import { Logger } from 'winston';

import { Paths } from '../openapi';
import {
  notificationsCountPermission,
  notificationsCreatePermission,
  notificationsListPermission,
  notificationsPermissions,
  notificationsSetReadPermission,
} from '../permissions';
import { initDB } from './db';
import {
  createNotification,
  getNotifications,
  getNotificationsCount,
  setRead,
} from './handlers';
import { DefaultUser } from './types';

interface RouterOptions {
  logger: Logger;
  dbConfig: Config;
  catalogClient: CatalogClient;
  identity: IdentityApi;
  permissions: PermissionEvaluator;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, dbConfig, catalogClient, identity, permissions } = options;

  /*
   * User's entity must be present in the catalog.
   * To properly set identity, see packages/backend/src/plugins/auth.ts or https://backstage.io/docs/auth/identity-resolver
   */
  const getLoggedInUser = (request: express.Request): Promise<string> =>
    identity.getIdentity({ request }).then(identityResponse => {
      // user:default/guest
      let author = identityResponse?.identity.userEntityRef;
      if (author) {
        if (author.startsWith('user:')) {
          author = author.slice('user:'.length);
        }
      } else {
        logger.warn(
          `Can not find user in the catalog, using "${DefaultUser}" instead`,
        );
      }
      return author || DefaultUser;
    });

  const checkPermission = async (
    request: express.Request,
    permission: BasicPermission,
    loggedInUser: string,
  ) => {
    const token = getBearerTokenFromAuthorizationHeader(
      request.header('authorization'),
    );
    const decision = (
      await permissions.authorize([{ permission }], {
        token,
      })
    )[0];

    if (decision.result === AuthorizeResult.DENY) {
      throw new NotAllowedError(
        `The user ${loggedInUser} is unauthorized to ${permission.name}`,
      );
    }
  };

  const permissionIntegrationRouter = createPermissionIntegrationRouter({
    permissions: notificationsPermissions,
  });

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
    definition: '../../plugins/notifications-backend/src/openapi.yaml',
  });

  await api.init();

  api.register(
    'createNotification',
    async (
      c: Context<Paths.CreateNotification.RequestBody>,
      req: express.Request,
      res: express.Response,
      next,
    ) => {
      const loggedInUser = await getLoggedInUser(req);
      await checkPermission(req, notificationsCreatePermission, loggedInUser);

      createNotification(dbClient, catalogClient, c.request.requestBody)
        .then(result => res.json(result))
        .catch(next);
    },
  );

  api.register(
    'getNotifications',
    async (c, req: express.Request, res: express.Response, next) => {
      const loggedInUser = await getLoggedInUser(req);
      await checkPermission(req, notificationsListPermission, loggedInUser);

      const q: Paths.GetNotifications.QueryParameters = Object.assign(
        {},
        c.request.query,
      );
      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.pageNumber = stringToNumber(q.pageNumber);
      q.pageSize = stringToNumber(q.pageSize);
      q.read = stringToBool(q.read);

      getNotifications(
        dbClient,
        loggedInUser,
        catalogClient,
        q,
        q.pageSize,
        q.pageNumber,
        q,
      )
        .then(notifications => res.json(notifications))
        .catch(next);
    },
  );

  api.register(
    'getNotificationsCount',
    async (c, req: express.Request, res: express.Response, next) => {
      const loggedInUser = await getLoggedInUser(req);
      await checkPermission(req, notificationsCountPermission, loggedInUser);

      const q: Paths.GetNotificationsCount.QueryParameters = Object.assign(
        {},
        c.request.query,
      );

      // we need to convert strings to real types due to open PR https://github.com/openapistack/openapi-backend/pull/571
      q.read = q.read = stringToBool(q.read);

      getNotificationsCount(dbClient, loggedInUser, catalogClient, q)
        .then(result => res.json(result))
        .catch(next);
    },
  );

  api.register(
    'setRead',
    async (c, req: express.Request, res: express.Response, next) => {
      const loggedInUser = await getLoggedInUser(req);
      await checkPermission(req, notificationsSetReadPermission, loggedInUser);

      const messageId = c.request.query.messageId.toString();
      const read = c.request.query.read.toString() === 'true';

      setRead(dbClient, loggedInUser, messageId, read)
        .then(result => res.json(result))
        .catch(next);
    },
  );

  // create router
  const router = Router();
  router.use(express.json());
  router.use(permissionIntegrationRouter);
  router.use((req, res, next) => {
    if (!next) {
      throw new Error('next is undefined');
    }
    const validation = api.validateRequest(req as Request);
    if (!validation.valid) {
      throw validation.errors;
    }

    api.handleRequest(req as Request, req, res, next);
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

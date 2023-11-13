import { errorHandler } from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { Config } from '@backstage/config';
import { NotificationsSortingRequest } from '@backstage/plugin-notifications-common';

import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';

import { initDB } from './db';
import {
  createNotification,
  getNotifications,
  getNotificationsCount,
  setRead,
} from './handlers';

interface RouterOptions {
  logger: Logger;
  dbConfig: Config;
  catalogClient: CatalogClient;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, dbConfig, catalogClient } = options;

  const router = Router();
  router.use(express.json());

  if (!dbConfig) {
    logger.error('Missing dbConfig');
    throw new Error('Missing database config');
  }

  // create DB client and tables
  const dbClient = await initDB(dbConfig);

  // rest endpoints/operations
  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.get('/notifications/count', (request, response, next) => {
    getNotificationsCount(dbClient, catalogClient, request.query)
      .then(result => response.json(result))
      .catch(next);
  });

  router.get('/notifications', (request, response, next) => {
    const { pageSize, pageNumber, orderBy, orderByDirec } = request.query;

    if (
      (typeof pageSize !== 'string' && typeof pageSize !== 'undefined') ||
      (typeof pageNumber !== 'string' && typeof pageNumber !== 'undefined')
    ) {
      throw new Error(
        'either pageSize or pageNumber query string parameters are missing/invalid',
      );
    }

    const pageSizeNum = pageSize ? Number.parseInt(pageSize, 10) : undefined;
    const pageNumberNum = pageNumber
      ? Number.parseInt(pageNumber, 10)
      : undefined;

    if (Number.isNaN(pageSizeNum) || Number.isNaN(pageNumberNum)) {
      throw new Error('either pageSize or pageNumber is not a number');
    }

    const sorting: NotificationsSortingRequest = {
      fieldName: orderBy?.toString(),
      direction: orderByDirec?.toString(),
    };

    getNotifications(
      dbClient,
      catalogClient,
      request.query,
      pageSizeNum,
      pageNumberNum,
      sorting,
    )
      .then(notifications => response.json(notifications))
      .catch(next);
  });

  router.post('/notifications', (request, response, next) => {
    createNotification(dbClient, catalogClient, request.body)
      .then(result => response.json(result))
      .catch(next);
  });

  router.put('/notifications/read', (request, response, next) => {
    const { messageId, user, read } = request.query;
    if (
      typeof messageId !== 'string' ||
      typeof user !== 'string' ||
      typeof read !== 'string'
    ) {
      throw new Error(
        'the following query parameters must be provided: messageId - string, user - string, read - false/true (boolean)',
      );
    }

    let readBool: boolean;

    switch (read) {
      case 'true':
        readBool = true;
        break;
      case 'false':
        readBool = false;
        break;
      default:
        throw new Error(
          'value of parameter "read" must be either "false" or "true"',
        );
    }

    setRead(dbClient, messageId, user, readBool)
      .then(() => response.end())
      .catch(next);
  });

  router.use(errorHandler());
  return router;
}

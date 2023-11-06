import { errorHandler } from '@backstage/backend-common';
import { CatalogClient } from '@backstage/catalog-client';
import { Config } from '@backstage/config';

import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';

import { initDB } from './db';
import {
  createNotification,
  getNotifications,
  getNotificationsCount,
} from './handlers';
import { NotificationsQuerySorting } from './types';

interface RouterOptions {
  logger: Logger;
  dbConfig: Config;
  catalogClient: CatalogClient;
}

const orderByFieldNames: NotificationsQuerySorting['fieldName'][] = [
  'title',
  'message',
  'created',
  'topic',
  'origin',
];

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
    const {
      pageSize,
      pageNumber,
      orderBy = 'created',
      orderByDirec = 'desc',
    } = request.query;

    if (typeof pageSize !== 'string' || typeof pageNumber !== 'string') {
      throw new Error(
        'either pageSize or pageNumber query string parameters are missing/invalid',
      );
    }

    const pageSizeNum = Number.parseInt(pageSize, 10);
    const pageNumberNum = Number.parseInt(pageNumber, 10);

    if (Number.isNaN(pageSizeNum) || Number.isNaN(pageNumberNum)) {
      throw new Error('either pageSize or pageNumber is not a number');
    }

    const orderByIndex = orderByFieldNames.findIndex(f => f === orderBy);
    const direction = orderByDirec?.toString();
    if (orderByIndex < 0 || !['asc', 'desc'].includes(direction)) {
      throw new Error(
        `The orderBy parameter can be one of ${orderByFieldNames.join(
          ',',
        )}. The orderByDirec can be either 'asc' or 'desc'.`,
      );
    }

    getNotifications(
      dbClient,
      catalogClient,
      request.query,
      pageSizeNum,
      pageNumberNum,
      orderByFieldNames[orderByIndex],
      direction as 'asc' | 'desc',
    )
      .then(notifications => response.json(notifications))
      .catch(next);
  });

  router.post('/notifications', (request, response, next) => {
    createNotification(dbClient, catalogClient, request.body)
      .then(result => response.json(result))
      .catch(next);
  });

  router.use(errorHandler());
  return router;
}

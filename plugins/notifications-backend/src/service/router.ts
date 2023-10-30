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

  router.get('/notifications/count', (request, response) => {
    getNotificationsCount(dbClient, request.query).then(result =>
      response.json(result),
    );
  });

  router.get('/notifications', (request, response) => {
    const { pageSize, pageNumber } = request.query;

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

    getNotifications(dbClient, request.query, pageSizeNum, pageNumberNum).then(
      notifications => response.json(notifications),
    );
  });

  router.post('/notifications', (request, response, next) => {
    createNotification(dbClient, catalogClient, request.body)
      .then(result => response.json(result))
      .catch(next);
  });

  router.use(errorHandler());
  return router;
}

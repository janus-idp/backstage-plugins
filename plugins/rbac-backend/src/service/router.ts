import { errorHandler } from '@backstage/backend-common';

import express from 'express';
import Router from 'express-promise-router';

export interface RouterOptions {}

export async function createRouter(
  _options: RouterOptions,
): Promise<express.Router> {
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });
  router.use(errorHandler());
  return router;
}

import { errorHandler } from '@backstage/backend-common';

import express from 'express';
import Router from 'express-promise-router';
import { Knex } from 'knex';
import { Logger } from 'winston';

export interface RouterOptions {
  logger: Logger;
  dbClient: Knex<any, unknown[]>;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, dbClient } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/notifications/count', async (_, response) => {
    let msgcount = -1;
    await dbClient('messages')
      .count('* as CNT')
      .then(count => {
        msgcount = (count[0]?.CNT as unknown as number) || -1;
      });
    response.json({ status: 'ok', count: msgcount });
  });

  router.post('/notifications', async (request, response) => {
    let msgid = -1;
    await dbClient('messages')
      .insert(request.body)
      .returning('id')
      .then(id => {
        // We should harden the type
        msgid = id as unknown as number;
      });
    response.json({ status: 'ok', msgid: msgid });
  });
  router.get('/notifications', async (_, response) => {
    let messages = '{}';
    await dbClient('messages')
      .select('*')
      .then(body => {
        messages = body as unknown as string;
      });
    response.json(messages);
  });

  router.use(errorHandler());
  return router;
}

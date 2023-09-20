import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';

export interface RouterOptions {
  db: Knex<any, unknown[]>;
  logger: Logger;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, db } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/notifications/count', async (_, response) => {
    var msgcount = -1;
    await db('messages').count('* as CNT').then(function(count) {
      msgcount = count[0].CNT;
    });
    response.json({ status: 'ok' , count: msgcount});
  });

  router.post('/notifications', async (request, response) => {
    var msgid = -1;
    await db('messages').insert(request.body).returning('id').then(function (id) {
      msgid = id;
    });
    response.json({ status: 'ok' , msgid: msgid});
  })
  router.get('/notifications', async (_, response) => {
    var messages = '{}';
    await db('messages').select('*').then(function(body) {
      messages = body;
    });
    response.json(messages);
  });

  router.use(errorHandler());
  return router;
}

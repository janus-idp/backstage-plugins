import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import express from 'express';
import Router from 'express-promise-router';
import OpenAI from 'openai';

import { CompletionsRequestBody } from './types';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.post('/chat/completions', async (request, response) => {
    const { model, messages }: CompletionsRequestBody = request.body;
    const baseURL = config.getString('lightspeed.baseURL');
    const apiKey = config.getString('lightspeed.apiKey');

    const openai = new OpenAI({
      baseURL: baseURL,
      apiKey: apiKey,
    });

    try {
      const stream = await openai.chat.completions.create({
        messages: messages,
        model: model,
        stream: true,
      });

      for await (const chunk of stream) {
        const created = chunk.created.toString();
        const content = chunk.choices[0]?.delta?.content || '';
        const role = chunk.choices[0]?.delta?.role || '';
        response.write(JSON.stringify({ created, message: { content, role } }));
      }

      response.end();
    } catch (error) {
      logger.error(`Error fetching completions from ${baseURL}: ${error}`);
      response.status(500).end();
    }
  });

  router.use(errorHandler());
  return router;
}

import { errorHandler } from '@backstage/backend-common';

import { HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import express from 'express';
import Router from 'express-promise-router';

import { QueryRequestBody, RouterOptions } from './types';
import { validateCompletionsRequest } from './validation';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  router.post(
    '/v1/query',
    validateCompletionsRequest,
    async (request, response) => {
      const { conversation_id, model, query, serverURL }: QueryRequestBody =
        request.body;
      try {
        const openAIApi = new ChatOpenAI({
          apiKey: 'sk-no-key-required', // authorization token is used
          model: model,
          streaming: false,
          temperature: 0,
          configuration: {
            // bearer token should already applied in proxy header
            // baseOptions: {
            //   headers: {
            //     ...(token && { Authorization: `Bearer <token>` }),
            //   },
            // },
            baseURL: serverURL,
          },
        });

        const prompt = ChatPromptTemplate.fromMessages([
          [
            'system',
            'You are a helpful assistant that can answer question in Red Hat Developer Hub.',
          ],
          new MessagesPlaceholder('messages'),
        ]);

        const chain = prompt.pipe(openAIApi);

        const res = await chain.invoke({
          messages: [new HumanMessage(query)],
        });
        const data = {
          conversation_id: conversation_id,
          response: res.content,
        };
        response.json(data);
        response.end();
      } catch (error) {
        const errormsg = `Error fetching completions from ${serverURL}: ${error}`;
        logger.error(errormsg);
        response.status(500).json({ error: errormsg });
      }
    },
  );

  router.use(errorHandler());
  return router;
}

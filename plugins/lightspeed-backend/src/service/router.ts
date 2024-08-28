import { errorHandler } from '@backstage/backend-common';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';

import express from 'express';
import Router from 'express-promise-router';
import { APIError } from 'openai';

import { QueryRequestBody } from './types';
import { validateCompletionsRequest } from './validation';


import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage} from "@langchain/core/messages";
import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.post(
    '/v1/query',
    validateCompletionsRequest,
    async (request, response) => {
      const { model, query, serverURL }: QueryRequestBody = request.body;
      try {
          const openAIApi = new ChatOpenAI({
            apiKey:"sk-no-key-required", // authorization token is used
            model: model,
            streaming: false,
            temperature: 0 , 
            configuration: { 
                // bearer token should already applied in proxy header
                // baseOptions: {
                //   headers: {
                //     ...(token && { Authorization: `Bearer ${token}` }),
                //   },
                // },
                baseURL: serverURL
              }
          });

          const chain = ChatPromptTemplate.fromMessages([
            [
              "system",
              "You are a helpful assistant that can answer question in Red Hat Developer Hub.",
            ],
            new MessagesPlaceholder("messages"),
          ]).pipe(openAIApi);
      
          // const chain = prompt.pipe(openAIApi);

          const res = await chain.invoke({
            messages: [
              new HumanMessage(
                query
              ),
            ],
          });
          response.write(res.content)
          response.end();
      } catch (error) {
        if (error instanceof APIError) {
          const status = error.status || 500;
          response.status(status).json({ error: error.message });
        } else {
          logger.error(`Error fetching completions from ${serverURL}: ${error}`);
          response.status(500).end();
        }
      }
    },
  );

  router.use(errorHandler());
  return router;
}

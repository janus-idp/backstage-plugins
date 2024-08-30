import { errorHandler } from '@backstage/backend-common';

import express from 'express';
import Router from 'express-promise-router';
import { APIError } from 'openai';

import { RouterOptions, QueryRequestBody } from './types';
import { validateCompletionsRequest } from './validation';


import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage} from "@langchain/core/messages";
import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";


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
      const { conversation_id, model, query, serverURL }: QueryRequestBody = request.body;
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
                //     ...(token && { Authorization: `Bearer d51451d216eee94e88579069d92fca4f` }),
                //   },
                // },
                baseURL: serverURL
              }
          });

          const prompt = ChatPromptTemplate.fromMessages([
            [
              "system",
              "You are a helpful assistant that can answer question in Red Hat Developer Hub.",
            ],
            new MessagesPlaceholder("messages"),
          ]);
      
          const chain = prompt.pipe(openAIApi);

          const res = await chain.invoke({
            messages: [
              new HumanMessage(
                query
              ),
            ],
          });
          const data = {
            conversation_id: conversation_id,
            response: res.content
          };
          response.json(data)
          response.end();
      } catch (error) {
        if (error instanceof APIError) {
          const status = error.status || 500;
          response.status(status).json({ error: error.message });
        } else {
          const errormsg = `Error fetching completions from ${serverURL}: ${error}`
          logger.error(errormsg);
          response.status(500).json({ error: errormsg});
        }
      }
    },
  );

  router.use(errorHandler());
  return router;
}

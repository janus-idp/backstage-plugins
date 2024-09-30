import { errorHandler } from '@backstage/backend-common';

import { HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import express from 'express';
import Router from 'express-promise-router';
import { createProxyMiddleware } from 'http-proxy-middleware';

import {
  deleteHistory,
  loadHistory,
  saveHistory,
} from '../handlers/chatHistory';
import {
  DEFAULT_HISTORY_LENGTH,
  QueryRequestBody,
  Roles,
  RouterOptions,
} from './types';
import {
  validateCompletionsRequest,
  validateLoadHistoryRequest,
} from './validation';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  // Proxy middleware configuration
  const apiProxy = createProxyMiddleware({
    target: config.getConfigArray('lightspeed.servers')[0].getString('url'), // currently only single llm server is supported
    changeOrigin: true,
    onError: (err, _, res) => {
      res.status(500).json({ error: 'Proxy error', details: err.message });
    },
  });

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  // Middleware proxy to exclude /v1/query
  router.use('/v1', (req, res, next) => {
    if (req.path === '/query') {
      return next(); // This will skip proxying and go to /v1/query endpoint
    }
    // For all other /v1/* requests, use the proxy
    const apiToken = config
      .getConfigArray('lightspeed.servers')[0]
      .getOptionalString('token'); // currently only single llm server is supported
    req.headers.authorization = `Bearer ${apiToken}`;
    return apiProxy(req, res, next);
  });

  router.get(
    '/conversations/:conversation_id',
    validateLoadHistoryRequest,
    async (request, response) => {
      const conversation_id = request.params.conversation_id;
      const historyLength = Number(request.query.historyLength);

      const loadhistoryLength: number = historyLength || DEFAULT_HISTORY_LENGTH;
      try {
        const history = await loadHistory(conversation_id, loadhistoryLength);
        response.status(200).json(history);
        response.end();
      } catch (error) {
        const errormsg = `Error: ${error}`;
        logger.error(errormsg);
        response.status(500).json({ error: errormsg });
      }
    },
  );

  router.delete(
    '/conversations/:conversation_id',
    async (request, response) => {
      const conversation_id = request.params.conversation_id;
      try {
        response.status(200).json(await deleteHistory(conversation_id));
        response.end();
      } catch (error) {
        const errormsg = `${error}`;
        logger.error(errormsg);
        response.status(500).json({ error: errormsg });
      }
    },
  );

  router.post(
    '/v1/query',
    validateCompletionsRequest,
    async (request, response) => {
      const { conversation_id, model, query, serverURL }: QueryRequestBody =
        request.body;
      try {
        // currently only supports single server
        const apiToken = config
          .getConfigArray('lightspeed.servers')[0]
          .getOptionalString('token');

        const openAIApi = new ChatOpenAI({
          apiKey: apiToken || 'sk-no-key-required', // set to sk-no-key-required if api token is not provided
          model: model,
          streaming: true,
          streamUsage: false,
          temperature: 0,
          configuration: {
            baseOptions: {
              headers: {
                ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
              },
            },
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
        let content = '';
        for await (const chunk of await chain.stream({
          messages: [new HumanMessage(query)],
        })) {
          const data = {
            conversation_id: conversation_id,
            response: chunk,
          };
          const buf = Buffer.from(JSON.stringify(data));
          content += String(chunk.content);
          response.write(buf);
        }
        response.end();

        await saveHistory(conversation_id, Roles.HumanRole, query);
        await saveHistory(conversation_id, Roles.AIRole, content);
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

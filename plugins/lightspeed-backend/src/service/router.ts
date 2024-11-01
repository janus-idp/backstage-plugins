import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';

import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import express, { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import {
  deleteHistory,
  loadAllConversations,
  loadHistory,
  saveHistory,
} from '../handlers/chatHistory';
import {
  generateConversationId,
  validateUserRequest,
} from '../handlers/conversationId';
import {
  ConversationSummary,
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
  const { logger, config, httpAuth, userInfo } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    response.json({ status: 'ok' });
  });

  // Middleware proxy to exclude /v1/query
  router.use('/v1', async (req, res, next) => {
    if (req.path === '/query') {
      return next(); // This will skip proxying and go to /v1/query endpoint
    }

    // TODO: parse server_id from req.body and get URL and token when multi-server is supported
    const user = await userInfo.getUserInfo(await httpAuth.credentials(req));
    const userEntity = user.userEntityRef;

    logger.info(`/v1 receives call from user: ${userEntity}`);

    // Proxy middleware configuration
    const apiProxy = createProxyMiddleware({
      target: config.getConfigArray('lightspeed.servers')[0].getString('url'), // currently only single llm server is supported
      changeOrigin: true,
    });
    // For all other /v1/* requests, use the proxy
    const apiToken = config
      .getConfigArray('lightspeed.servers')[0]
      .getOptionalString('token'); // currently only single llm server is supported
    req.headers.authorization = `Bearer ${apiToken}`;
    return apiProxy(req, res, next);
  });

  router.post('/conversations', async (request, response) => {
    try {
      const userEntity = await userInfo.getUserInfo(
        await httpAuth.credentials(request),
      );
      const user_id = userEntity.userEntityRef;

      logger.info(`POST /conversations receives call from user: ${user_id}`);

      const conversation_id = generateConversationId(user_id);

      response.status(200).json({ conversation_id: conversation_id });
      response.end();
    } catch (error) {
      const errormsg = `${error}`;
      logger.error(errormsg);
      response.status(500).json({ error: errormsg });
    }
  });

  router.get('/conversations', async (request, response) => {
    try {
      const userEntity = await userInfo.getUserInfo(
        await httpAuth.credentials(request),
      );
      const user_id = userEntity.userEntityRef;
      logger.info(`GET /conversations receives call from user: ${user_id}`);
      const conversationList = await loadAllConversations(user_id);
      const conversationSummaryList: ConversationSummary[] = [];

      // currently only single llm server is supported
      const serverURL = config
        .getConfigArray('lightspeed.servers')[0]
        .getString('url');
      const apiToken = config
        .getConfigArray('lightspeed.servers')[0]
        .getOptionalString('token');

      // get model list and select first model to use for conversation summary
      const url = new URL(`${serverURL}/models`);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      });
      const data = await res.json();
      let model = '';
      if (data.data && data.data[0]) {
        model = data.data[0].id;
        logger.info(`using model ${model} for retriving conversation summary`);
      } else {
        throw Error(`no available model found in server ${serverURL}`);
      }

      // get summary
      const promises = conversationList.map(async conversation_id => {
        const conversationHistory = await loadHistory(
          conversation_id,
          DEFAULT_HISTORY_LENGTH,
        );
        const LastMessage = conversationHistory[conversationHistory.length - 1];
        const timestamp = LastMessage.response_metadata.created_at;

        const openAIApi = new ChatOpenAI({
          apiKey: apiToken || 'sk-no-key-required', // set to sk-no-key-required if api token is not provided
          model: model,
          streaming: false,
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

        const summarizePrompt = ChatPromptTemplate.fromMessages([
          [
            'system',
            "Your task is to summarize of user's main purpose of a conversation in a few words without any introductory phrases. ",
          ],
          new MessagesPlaceholder('messages'),
        ]);

        const newchain = summarizePrompt.pipe(openAIApi);
        const summary = await newchain.invoke({
          messages: [
            ...conversationHistory,
            new HumanMessage({
              content:
                'summarize the above conversation to be displayed as a title in frontend for people to get a main subject of the conversation. do not form a sentence, only return the subject of the main purpose. ',
            }),
          ],
        });
        const conversationSummary: ConversationSummary = {
          conversation_id: conversation_id,
          summary: String(summary.content),
          lastMessageTimestamp: timestamp,
        };
        conversationSummaryList.push(conversationSummary);
      });
      await Promise.all(promises);
      response.status(200).json(conversationSummaryList);
      response.end();
    } catch (error) {
      const errormsg = `${error}`;
      logger.error(errormsg);
      console.log(errormsg);
      response.status(500).json({ error: errormsg });
    }
  });

  router.get(
    '/conversations/:conversation_id',
    validateLoadHistoryRequest,
    async (request, response) => {
      const conversation_id = request.params.conversation_id;
      const historyLength = Number(request.query.historyLength);

      const loadhistoryLength: number = historyLength || DEFAULT_HISTORY_LENGTH;
      try {
        const userEntity = await userInfo.getUserInfo(
          await httpAuth.credentials(request),
        );
        const user_id = userEntity.userEntityRef;
        logger.info(
          `GET /conversations/:conversation_id receives call from user: ${user_id}`,
        );

        validateUserRequest(conversation_id, user_id); // will throw error and return 500 with error message if user_id does not match

        const history = await loadHistory(conversation_id, loadhistoryLength);
        response.status(200).json(history);
        response.end();
      } catch (error) {
        const errormsg = `${error}`;
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
        const userEntity = await userInfo.getUserInfo(
          await httpAuth.credentials(request),
        );
        const user_id = userEntity.userEntityRef;

        logger.info(
          `DELETE /conversations/:conversation_id receives call from user: ${user_id}`,
        );

        validateUserRequest(conversation_id, user_id); // will throw error and return 500 with error message if user_id does not match

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
        const userEntity = await userInfo.getUserInfo(
          await httpAuth.credentials(request),
        );
        const user_id = userEntity.userEntityRef;

        logger.info(`/v1/query receives call from user: ${user_id}`);
        validateUserRequest(conversation_id, user_id); // will throw error and return 500 with error message if user_id does not match

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

        let conversationHistory: BaseMessage[] = [];
        try {
          conversationHistory = await loadHistory(
            conversation_id,
            DEFAULT_HISTORY_LENGTH,
          );
        } catch (error) {
          logger.error(`${error}`);
        }

        const chain = prompt.pipe(openAIApi);
        let content = '';
        const userMessageTimestamp = Date.now();
        let botMessageTimestamp;
        for await (const chunk of await chain.stream({
          messages: [
            ...conversationHistory,
            new HumanMessage({
              content: query,
              response_metadata: {
                created_at: userMessageTimestamp,
              },
            }),
          ],
        })) {
          if (!botMessageTimestamp) {
            botMessageTimestamp = Date.now();
          }
          chunk.response_metadata.created_at = botMessageTimestamp;
          const data = {
            conversation_id: conversation_id,
            response: chunk,
          };
          const buf = Buffer.from(JSON.stringify(data));
          content += String(chunk.content);
          response.write(buf);
        }
        response.end();

        await saveHistory(
          conversation_id,
          Roles.HumanRole,
          query,
          userMessageTimestamp,
        );
        await saveHistory(
          conversation_id,
          Roles.AIRole,
          content,
          botMessageTimestamp,
        );
      } catch (error) {
        const errormsg = `Error fetching completions from ${serverURL}: ${error}`;
        logger.error(errormsg);
        response.status(500).json({ error: errormsg });
      }
    },
  );

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}

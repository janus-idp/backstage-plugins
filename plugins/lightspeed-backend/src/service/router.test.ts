import { mockServices } from '@backstage/backend-test-utils';

import { AIMessageChunk } from '@langchain/core/messages';
import express from 'express';
import request from 'supertest';

import { saveHistory } from '../handlers/chatHistory';
import { Roles } from '../service/types';
import { createRouter } from './router';

const mockChunks = [
  new AIMessageChunk({
    content: 'Mockup',
  }),
  new AIMessageChunk({
    content: 'AI',
  }),
  new AIMessageChunk({
    content: 'Message',
  }),
  new AIMessageChunk({
    content: '',
    response_metadata: {
      finish_reason: 'stop',
    },
  }),
];

const mockStream = jest.fn().mockImplementation(async function* stream() {
  for (const chunk of mockChunks) {
    yield chunk;
  }
});

jest.mock('@langchain/core/prompts', () => {
  // Import the actual module to ensure other exports are available
  const actualModule = jest.requireActual('@langchain/core/prompts');

  return {
    ...actualModule,
    ChatPromptTemplate: {
      fromMessages: jest.fn().mockImplementation(() => ({
        pipe: jest.fn().mockReturnValue({
          stream: mockStream,
        }),
      })),
    },
  };
});

const mockConversationId = 'user1+1q2w3e4r-qwer1234';
const mockServerURL = 'http://localhost:7007/api/proxy/lightspeed/api';
const mockModel = 'test-model';
const mockToken = 'dummy-token';

const mockConfiguration = mockServices.rootConfig({
  data: {
    lightspeed: {
      servers: [
        {
          id: 'test-server',
          url: mockServerURL,
          token: mockToken,
        },
      ],
    },
  },
});

const mockServerResponse = { data: 'redirect to v1/models' };
// Mocking the actual request that the proxy would make
jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest
    .fn()
    .mockImplementation(() => (req: express.Request, res: express.Response) => {
      if (req.headers.authorization !== `Bearer ${mockToken}`) {
        res.status(403).json({ error: 'unauthorized' }); // test if config.token has been added in authorization header
        return;
      }
      if (req.path === '/models') {
        res.status(200).json(mockServerResponse);
        return;
      }
      res.status(404).json({ error: 'unknown path' });
    }),
}));

(global.fetch as jest.Mock) = jest.fn();

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: mockServices.logger.mock(),
      config: mockConfiguration,

      // TODO: for user authentication
      // httpAuth: mockServices.httpAuth({
      //   pluginId: 'lightspeed',
      //   defaultCredentials: mockCredentials.user(),
      // }),
      // userInfo: mockServices.userInfo({
      //   userEntityRef: 'user1',
      // }),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('/v1/* proxy middleware', () => {
    it('should proxy requests to /v1/models', async () => {
      const response = await request(app).get('/v1/models');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockServerResponse);
    });

    it('unknown path', async () => {
      const response = await request(app).get('/v1/unknown');

      expect(response.status).toBe(404);
      expect(String(response.error)).toContain('cannot GET /v1/unknown');
    });
  });

  describe('GET and DELETE /conversations/:conversation_id', () => {
    it('load history', async () => {
      const humanMessage = 'Hello';
      const aiMessage = 'Hi! How can I help you today?';
      await saveHistory(mockConversationId, Roles.HumanRole, humanMessage);
      await saveHistory(mockConversationId, Roles.AIRole, aiMessage);

      const response = await request(app).get(
        `/conversations/${mockConversationId}`,
      );
      expect(response.statusCode).toEqual(200);
      // Parse response body
      const responseData = response.body;

      // Check that responseData is an array
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBe(2);

      expect(responseData[0].id).toContain('HumanMessage');
      expect(responseData[0].kwargs?.content).toBe(humanMessage);

      expect(responseData[1].id).toContain('AIMessage');
      expect(responseData[1].kwargs?.content).toBe(aiMessage);
    });

    it('delete history', async () => {
      // delete request
      const deleteResponse = await request(app).delete(
        `/conversations/${mockConversationId}`,
      );
      expect(deleteResponse.statusCode).toEqual(200);
    });

    it('load history with deleted conversation_id', async () => {
      const response = await request(app).get(
        `/conversations/${mockConversationId}`,
      );
      expect(response.statusCode).toEqual(500);
      expect(response.body.error).toContain('unknown conversation_id');
    });
  });

  describe('POST /v1/query', () => {
    it('chat completions', async () => {
      const response = await request(app).post('/v1/query').send({
        model: mockModel,
        conversation_id: mockConversationId,
        query: 'Hello',
        serverURL: mockServerURL,
      });

      expect(response.statusCode).toEqual(200);
      const expectedData = 'Mockup AI Message';
      let receivedData = '';
      const chunkList = response.text.split('}{').map((chunk, index, arr) => {
        if (index === 0) {
          return `${chunk}}`;
        } else if (index === arr.length - 1) {
          return `{${chunk}`;
        }
        return `{${chunk}}`;
      });
      expect(chunkList.length).toEqual(4);
      // Parse each chunk individually
      chunkList.forEach(chunk => {
        const parsedChunk = JSON.parse(chunk);
        expect(parsedChunk.conversation_id).toEqual(mockConversationId);
        if (
          parsedChunk.response?.kwargs?.response_metadata?.finish_reason !==
          'stop'
        ) {
          receivedData += parsedChunk.response?.kwargs?.content;
          receivedData += ' ';
        }
      });
      receivedData = receivedData.trimEnd(); // remove space at the last chunk
      expect(receivedData).toEqual(expectedData);
    });

    it('returns 400 if conversation_id is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        model: mockModel,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'conversation_id is required and must be a non-empty string',
      );
      expect(mockStream).not.toHaveBeenCalled();
    });

    it('returns 400 if serverURL is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        model: mockModel,
        conversation_id: mockConversationId,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'serverURL is required and must be a non-empty string',
      );
      expect(mockStream).not.toHaveBeenCalled();
    });

    it('returns 400 if model is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        conversation_id: mockConversationId,
        serverURL: mockServerURL,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'model is required and must be a non-empty string',
      );
      expect(mockStream).not.toHaveBeenCalled();
    });

    it('returns 400 if query is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        model: mockModel,
        conversation_id: mockConversationId,
        serverURL: mockServerURL,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'query is required and must be a non-empty string',
      );
      expect(mockStream).not.toHaveBeenCalled();
    });

    it('returns 500 if unexpected error', async () => {
      mockStream.mockImplementationOnce(async () => {
        throw new Error();
      });
      const response = await request(app).post('/v1/query').send({
        model: 'nonexistent-model',
        conversation_id: mockConversationId,
        serverURL: mockServerURL,
        query: 'Hello',
      });
      expect(response.statusCode).toEqual(500);
    });
  });
});

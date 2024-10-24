import { type BackendFeature } from '@backstage/backend-plugin-api';
import {
  mockCredentials,
  mockServices,
  startTestBackend,
} from '@backstage/backend-test-utils';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import express from 'express';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';

import { handlers, LOCAL_AI_ADDR } from '../../__fixtures__/handlers';
import { deleteHistory, saveHistory } from '../handlers/chatHistory';
import { lightspeedPlugin } from '../plugin';
import { Roles } from '../service/types';

const mockUserId = `user: default/user1`;
const mockConversationId = `${mockUserId}+1q2w3e4r-qwer1234`;
const encodedConversationId = encodeURIComponent(mockConversationId);

const mockAnotherUserId = `user: default/anotheruser`;
const mockAnotherConversationId = `${mockAnotherUserId}+1q2w3e4r-qwer1234`;
const encodedAnotherConversationId = encodeURIComponent(
  mockAnotherConversationId,
);

const mockModel = 'test-model';
const mockToken = 'dummy-token';

const BASE_CONFIG = {
  lightspeed: {
    servers: [
      {
        id: 'test-server',
        url: LOCAL_AI_ADDR,
        token: mockToken,
      },
    ],
  },
};

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

jest.mock('@backstage/backend-plugin-api', () => ({
  ...jest.requireActual('@backstage/backend-plugin-api'),
  UserInfoService: jest.fn().mockImplementation(() => ({
    getUserInfo: jest.fn().mockResolvedValue({
      BackstageUserInfo: {
        userEntityRef: mockUserId,
      },
    }),
  })),
}));

describe('lightspeed router tests', () => {
  const server = setupServer(...handlers);

  beforeAll(() =>
    server.listen({
      /*
       *  This is required so that msw doesn't throw
       *  warnings when the backend is requesting an endpoint
       */
      onUnhandledRequest: (req, print) => {
        if (req.url.includes('/api/lightspeed')) {
          // bypass
          return;
        }
        print.warning();
      },
    }),
  );

  afterAll(() => server.close());

  afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
  });

  async function startBackendServer(config?: Record<PropertyKey, unknown>) {
    const features: (BackendFeature | Promise<{ default: BackendFeature }>)[] =
      [
        lightspeedPlugin,
        mockServices.rootLogger.factory(),
        mockServices.rootConfig.factory({
          data: { ...BASE_CONFIG, ...(config || {}) },
        }),
        mockServices.httpAuth.factory({
          defaultCredentials: mockCredentials.user(mockUserId),
        }),
        mockServices.userInfo.factory(),
      ];
    return (await startTestBackend({ features })).server;
  }

  describe('GET /health', () => {
    it('returns ok', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer).get(
        '/api/lightspeed/health',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('/v1/* proxy middleware', () => {
    it('should proxy requests to /v1/models', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer).get(
        '/api/lightspeed/v1/models',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockServerResponse);
    });

    it('unknown path', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer).get(
        '/api/lightspeed/v1/unknown',
      );

      expect(response.status).toBe(404);
      expect(String(response.error)).toContain(
        'Error: cannot GET /api/lightspeed/v1/unknown (404)',
      );
    });
  });

  describe('POST /conversations', () => {
    it('generate new conversation_id', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer).post(
        `/api/lightspeed/conversations`,
      );
      expect(response.statusCode).toEqual(200);
      const conversation_id = response.body.conversation_id;

      expect(conversation_id.length).toBe(mockUserId.length + 17); // user_id length + `+` + 16-character session_id
      const [user_id, session_id] = conversation_id.split('+');
      expect(user_id).toBe(mockUserId);
      expect(/^[a-zA-Z0-9]+$/.test(session_id)).toBe(true);
    });
  });

  describe('GET and DELETE /conversations/:conversation_id', () => {
    const humanMessage = 'Hello';
    const aiMessage = 'Hi! How can I help you today?';

    beforeEach(async () => {
      await saveHistory(mockConversationId, Roles.HumanRole, humanMessage);
      await saveHistory(mockConversationId, Roles.AIRole, aiMessage);
    });

    it('load history', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer).get(
        `/api/lightspeed/conversations/${encodedConversationId}`,
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
      const backendServer = await startBackendServer();
      const deleteResponse = await request(backendServer).delete(
        `/api/lightspeed/conversations/${encodedConversationId}`,
      );
      expect(deleteResponse.statusCode).toEqual(200);
    });

    it('load history with deleted conversation_id', async () => {
      await deleteHistory(mockConversationId);
      const backendServer = await startBackendServer();
      const response = await request(backendServer).get(
        `/api/lightspeed/conversations/${encodedConversationId}`,
      );
      expect(response.statusCode).toEqual(500);
      expect(response.body.error).toContain('unknown conversation_id');
    });

    it('load history from another authenticated user should error out', async () => {
      const backendServer = await startBackendServer();

      const response = await request(backendServer).get(
        `/api/lightspeed/conversations/${encodedAnotherConversationId}`,
      );
      expect(response.statusCode).toEqual(500);
      expect(response.body.error).toContain(
        'does not belong to authenticated user',
      );
    });

    it('delete history from another authenticated user should error out', async () => {
      const backendServer = await startBackendServer();
      const deleteResponse = await request(backendServer).delete(
        `/api/lightspeed/conversations/${encodedAnotherConversationId}`,
      );
      expect(deleteResponse.statusCode).toEqual(500);
      expect(deleteResponse.body.error).toContain(
        'does not belong to authenticated user',
      );
    });
  });

  describe('POST /v1/query', () => {
    const chatOpenAISpy = jest.spyOn(ChatPromptTemplate, 'fromMessages');

    it('chat completions', async () => {
      const backendServer = await startBackendServer();

      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: mockModel,
          conversation_id: mockConversationId,
          query: 'Hello',
          serverURL: LOCAL_AI_ADDR,
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
      const backendServer = await startBackendServer();
      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: mockModel,
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'conversation_id is required and must be a non-empty string',
      );
      expect(chatOpenAISpy).not.toHaveBeenCalled();
    });

    it('returns 400 if serverURL is missing', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: mockModel,
          conversation_id: mockConversationId,
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'serverURL is required and must be a non-empty string',
      );
      expect(chatOpenAISpy).not.toHaveBeenCalled();
    });

    it('returns 400 if model is missing', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          conversation_id: mockConversationId,
          serverURL: LOCAL_AI_ADDR,
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'model is required and must be a non-empty string',
      );
      expect(chatOpenAISpy).not.toHaveBeenCalled();
    });

    it('returns 400 if query is missing', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: mockModel,
          conversation_id: mockConversationId,
          serverURL: LOCAL_AI_ADDR,
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'query is required and must be a non-empty string',
      );
      expect(chatOpenAISpy).not.toHaveBeenCalled();
    });

    it('returns 500 if unexpected error', async () => {
      const backendServer = await startBackendServer();
      const nonExistentModel = 'nonexistent-model';
      server.use(
        http.post(`${LOCAL_AI_ADDR}/chat/completions`, () => {
          return new HttpResponse(
            JSON.stringify({
              error: {
                message: `model "${nonExistentModel}" not found, try pulling it first`,
                type: 'api_error',
              },
            }),
            { status: 404 },
          );
        }),
      );
      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: nonExistentModel,
          conversation_id: mockConversationId,
          serverURL: LOCAL_AI_ADDR,
          query: 'Hello',
        });
      expect(response.statusCode).toEqual(500);
    });

    it('returns 500 if query sent for a different user', async () => {
      const backendServer = await startBackendServer();
      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: mockModel,
          conversation_id: mockAnotherConversationId,
          query: 'Hello',
          serverURL: LOCAL_AI_ADDR,
        });
      expect(response.statusCode).toEqual(500);
      expect(response.body.error).toContain(
        'does not belong to authenticated user',
      );
    });
  });
});

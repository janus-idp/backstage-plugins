import { type BackendFeature } from '@backstage/backend-plugin-api';
import {
  mockCredentials,
  mockServices,
  startTestBackend,
} from '@backstage/backend-test-utils';

import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import express from 'express';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';

import { handlers, LOCAL_AI_ADDR } from '../../__fixtures__/handlers';
import { deleteHistory, saveHistory } from '../handlers/chatHistory';
import { lightspeedPlugin } from '../plugin';
import { Roles } from '../service/types';
import { ConversationSummary } from './types';

const mockUserId = `user: default/user1`;
const mockConversationId = `${mockUserId}+1q2w3e4r-qwer1234`;
const encodedConversationId = encodeURIComponent(mockConversationId);
const mockConversationId2 = `${mockUserId}+9i8u7y6t-654rew3`;

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

const mockServerResponse = {
  data: [
    {
      id: mockModel,
    },
  ],
};
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
const splitJsonObjects = (response: { text: string }): string[] =>
  response.text.split('}{').map((chunk, index, arr) => {
    if (index === 0) {
      return `${chunk}}`;
    } else if (index === arr.length - 1) {
      return `{${chunk}`;
    }
    return `{${chunk}}`;
  });

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
    let chatOpenAISpy: any;

    const setupStreamSpy = (mockStream: jest.Mock) => {
      // Spy on fromMessages and mock its return value
      jest
        .spyOn(ChatPromptTemplate, 'fromMessages')
        .mockImplementationOnce((): any => ({
          pipe: jest.fn().mockReturnValueOnce({
            stream: mockStream,
          }),
        }));
    };
    beforeEach(() => {
      chatOpenAISpy = jest.spyOn(ChatPromptTemplate, 'fromMessages');
    });

    afterEach(() => {
      chatOpenAISpy.mockRestore();
      chatOpenAISpy.mockReset();
      jest.clearAllMocks();
    });

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
      const chunkList = splitJsonObjects(response);

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

    it('should not have any history for the initial conversation', async () => {
      const mockStream = jest.fn().mockImplementation(async function* stream() {
        yield { content: 'Chunk 1', response_metadata: {} };
      });

      setupStreamSpy(mockStream);

      const backendServer = await startBackendServer();
      await deleteHistory(mockConversationId); // delete existing conversation history

      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: mockModel,
          conversation_id: mockConversationId,
          query: 'Hi',
          serverURL: LOCAL_AI_ADDR,
        });

      expect(response.statusCode).toEqual(200);
      expect(mockStream).toHaveBeenCalled();

      const streamCalledWithMessages = mockStream.mock.calls[0][0].messages;

      expect(streamCalledWithMessages).toHaveLength(1);
      expect(streamCalledWithMessages[0]).toBeInstanceOf(HumanMessage);
      expect(streamCalledWithMessages[0]).toEqual(
        expect.objectContaining({ content: 'Hi' }),
      );
    });

    it('should call the stream with conversation history', async () => {
      const mockStream = jest.fn().mockImplementation(async function* stream() {
        yield { content: 'Chunk 1', response_metadata: {} };
      });

      setupStreamSpy(mockStream);

      const backendServer = await startBackendServer();
      await deleteHistory(mockConversationId); // delete existing conversation history

      const humanMessage = 'Hi';
      const aiMessage = 'Hi! How can I help you today?';
      await saveHistory(mockConversationId, Roles.HumanRole, humanMessage);
      await saveHistory(mockConversationId, Roles.AIRole, aiMessage);

      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: mockModel,
          conversation_id: mockConversationId,
          query: 'What is Langchain?',
          serverURL: LOCAL_AI_ADDR,
        });

      expect(response.statusCode).toEqual(200);
      expect(mockStream).toHaveBeenCalled();

      const streamCalledWithMessages = mockStream.mock.calls[0][0].messages;

      expect(streamCalledWithMessages).toHaveLength(3);
      expect(streamCalledWithMessages[0]).toBeInstanceOf(HumanMessage);
      expect(streamCalledWithMessages[0]).toEqual(
        expect.objectContaining({ content: 'Hi' }),
      );

      expect(streamCalledWithMessages[1]).toBeInstanceOf(AIMessage);
      expect(streamCalledWithMessages[1]).toEqual(
        expect.objectContaining({ content: 'Hi! How can I help you today?' }),
      );

      expect(streamCalledWithMessages[2]).toBeInstanceOf(HumanMessage);
      expect(streamCalledWithMessages[2]).toEqual(
        expect.objectContaining({ content: 'What is Langchain?' }),
      );
    });

    it('should contain ai and human message timestamp', async () => {
      const delay = (ms = 100) =>
        new Promise<void>(resolve => setTimeout(resolve, ms));
      const mockStream = jest.fn().mockImplementation(async function* stream() {
        await delay();
        yield { content: 'Chunk 1', response_metadata: {} };
        await delay(); // delay of 100ms
        yield { content: 'Chunk 2', response_metadata: {} };
      });
      setupStreamSpy(mockStream); // use mockStream

      const backendServer = await startBackendServer();
      await deleteHistory(mockConversationId);

      const response = await request(backendServer)
        .post('/api/lightspeed/v1/query')
        .send({
          model: mockModel,
          conversation_id: mockConversationId,
          query: 'Hello',
          serverURL: LOCAL_AI_ADDR,
        });

      const jsonStrings = splitJsonObjects(response);
      const aiMessages = jsonStrings.map(str => {
        try {
          return JSON.parse(str);
        } catch (error) {
          console.error(`Failed to parse: ${str}`);
          throw error;
        }
      });

      expect(response.statusCode).toEqual(200);
      expect(mockStream).toHaveBeenCalled();

      const humanMessage = mockStream.mock.calls[0][0].messages[0];
      const humanMessageTimestamp = humanMessage.response_metadata.created_at;
      expect(humanMessage).toBeInstanceOf(HumanMessage);
      expect(humanMessage).toEqual(
        expect.objectContaining({ content: 'Hello' }),
      );

      // check each ai message chunk timestamp to be greater than human message timestamp
      aiMessages.forEach(chunk => {
        expect(chunk.response.response_metadata.created_at).toBeGreaterThan(
          humanMessageTimestamp,
        );
      });
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

  describe('GET /conversations', () => {
    const mockSummary = 'mock summary';
    const mockAIMessage = new AIMessage(mockSummary);
    const mockInvokeReturnValue = jest.fn().mockResolvedValue(mockAIMessage);
    let chatPromptSpy: jest.SpyInstance;

    beforeEach(() => {
      // Setup fresh spy for each test
      chatPromptSpy = jest
        .spyOn(ChatPromptTemplate, 'fromMessages')
        .mockImplementation(
          () =>
            ({
              pipe: jest.fn().mockReturnValue({
                invoke: mockInvokeReturnValue,
              }),
            }) as any,
        );

      // Clear any existing history
      jest.clearAllMocks();
    });

    afterEach(() => {
      chatPromptSpy.mockRestore();
      jest.clearAllMocks();
    });

    const humanMessage = 'Hello';
    const aiMessage = 'Hi! How can I help you today?';
    it('load conversations list with summary', async () => {
      await saveHistory(mockConversationId, Roles.HumanRole, humanMessage);
      await saveHistory(mockConversationId, Roles.AIRole, aiMessage);

      // wait for 1ms for the second conversation to be saved to test for timestamp
      await new Promise(resolve => setTimeout(resolve, 1));

      await saveHistory(mockConversationId2, Roles.HumanRole, humanMessage);
      await saveHistory(mockConversationId2, Roles.AIRole, aiMessage);

      await new Promise(resolve => setTimeout(resolve, 1));
      const mockConversationId3 = 'user: default/user1+9i8u7y6t-654red3';
      await saveHistory(mockConversationId3, Roles.HumanRole, humanMessage);
      await saveHistory(mockConversationId3, Roles.AIRole, aiMessage);

      const backendServer = await startBackendServer();
      const response = await request(backendServer).get(
        `/api/lightspeed/conversations`,
      );
      expect(response.statusCode).toEqual(200);
      // Parse response body
      const responseData: ConversationSummary[] = response.body;

      // Check that responseData is an array
      expect(Array.isArray(responseData)).toBe(true);
      expect(responseData.length).toBe(3);
      const ids = responseData.map(item => item.conversation_id);

      // Check if both expected IDs are present
      expect(ids).toContain(mockConversationId);
      expect(ids).toContain(mockConversationId2);
      expect(ids).toContain(mockConversationId3);

      // check the summary
      expect(responseData[0].summary).toBe(mockSummary);
      expect(responseData[1].summary).toBe(mockSummary);
      expect(responseData[2].summary).toBe(mockSummary);

      // check the timestamp is in descending order
      expect(responseData[0].lastMessageTimestamp).toBeDefined();
      expect(responseData[1].lastMessageTimestamp).toBeDefined();
      expect(responseData[2].lastMessageTimestamp).toBeDefined();
      expect(responseData[0].lastMessageTimestamp).toBeGreaterThan(
        responseData[1].lastMessageTimestamp,
      );
      expect(responseData[1].lastMessageTimestamp).toBeGreaterThan(
        responseData[2].lastMessageTimestamp,
      );
    });
  });
});

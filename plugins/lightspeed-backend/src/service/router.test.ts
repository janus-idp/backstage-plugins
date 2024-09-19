import { getVoidLogger } from '@backstage/backend-common';
// import { mockCredentials, mockServices } from '@backstage/backend-test-utils';
import { MockConfigApi } from '@backstage/test-utils';

import { AIMessage } from '@langchain/core/messages';
import express from 'express';
import request from 'supertest';

import { saveHistory } from '../handlers/chatHistory';
import { Roles } from '../service/types';
import { createRouter } from './router';

const mockAIMessage = new AIMessage('Mockup AI Message');
const mockInvokeReturnValue = jest.fn().mockResolvedValue(mockAIMessage);

jest.mock('@langchain/core/prompts', () => {
  // Import the actual module to ensure other exports are available
  const actualModule = jest.requireActual('@langchain/core/prompts');

  return {
    ...actualModule,
    ChatPromptTemplate: {
      fromMessages: jest.fn().mockImplementation(() => ({
        pipe: jest.fn().mockReturnValue({
          invoke: mockInvokeReturnValue,
        }),
      })),
    },
  };
});

const mockConversationId = 'user1+1q2w3e4r-qwer1234';
const mockServerURL = 'http://localhost:7007/api/proxy/lightspeed/api';
const mockModel = 'test-model';

const mockConfiguration = new MockConfigApi({
  lightspeed: {
    servers: [
      {
        id: 'test-server',
        url: mockServerURL,
        token: 'dummy-token',
      },
    ],
  },
});

(global.fetch as jest.Mock) = jest.fn();

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
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
      expect(response.body.error).toContain('unkown conversation_id');
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
      const expectedData = 'Mockup AI Message';
      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain(expectedData);
    });

    it('returns 400 if conversation_id is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        model: mockModel,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'conversation_id is required and must be a non-empty string',
      );
      expect(mockInvokeReturnValue).not.toHaveBeenCalled();
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
      expect(mockInvokeReturnValue).not.toHaveBeenCalled();
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
      expect(mockInvokeReturnValue).not.toHaveBeenCalled();
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
      expect(mockInvokeReturnValue).not.toHaveBeenCalled();
    });

    it('returns 500 if unexpected error', async () => {
      mockInvokeReturnValue.mockImplementationOnce(async () => {
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

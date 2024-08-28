import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import express from 'express';
import { APIError } from 'openai';
import request from 'supertest';

import { createRouter } from './router';
import { AIMessage} from "@langchain/core/messages";

const mockAIMessage = new AIMessage('Mockup AI Message')
const mockInvokeReturnValue = jest.fn().mockResolvedValue(mockAIMessage)

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


(global.fetch as jest.Mock) = jest.fn();

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: new ConfigReader({
      }),
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

  const mockConversationId = "user1+1q2w3e4r-qwer1234"
  const mockServerURL = "http://localhost:7007/api/proxy/lightspeed/api"
  const mockModel = 'test-model'

  describe('POST /v1/query', () => {
    it('streams completions', async () => {
      const response = await request(app)
        .post('/v1/query')
        .send({
          model: mockModel,
          conversation_id: mockConversationId,
          query: 'Hello',
          serverURL: mockServerURL
        });
      const expectedData = 'Mockup AI Message';
      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain(expectedData);
    });

    it('returns 400 if coversatio_id is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        model: mockModel,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe('conversation_id is required and must be a non-empty string');
      expect(mockInvokeReturnValue).not.toHaveBeenCalled();
    });

    it('returns 400 if serverURL is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        model: mockModel,
        conversation_id: mockConversationId,
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe('serverURL is required and must be a non-empty string');
      expect(mockInvokeReturnValue).not.toHaveBeenCalled();
    });

    it('returns 400 if model is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        conversation_id: mockConversationId,
        serverURL: mockServerURL
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe('model is required and must be a non-empty string');
      expect(mockInvokeReturnValue).not.toHaveBeenCalled();
    });

    it('returns 400 if query is missing', async () => {
      const response = await request(app).post('/v1/query').send({
        model: mockModel,
        conversation_id: mockConversationId,
        serverURL: mockServerURL
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe('query is required and must be a non-empty string');
      expect(mockInvokeReturnValue).not.toHaveBeenCalled();
    });
   
    it('returns openai error', async () => {
      mockInvokeReturnValue.mockImplementationOnce(async () => {
        throw APIError.generate(
          400,
          { error: 'invalid model' },
          'Invalid model',
          {},
        );
      });
      const response = await request(app).post('/v1/query').send({
        model: 'nonexistent-model',
        conversation_id: mockConversationId,
        serverURL: mockServerURL,
        query: "Hello",
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe('400 "invalid model"');
    });

    it('returns 500 if unexpected error', async () => {
      mockInvokeReturnValue.mockImplementationOnce(async () => {
        throw new Error();
      });
      const response = await request(app).post('/v1/query').send({
        model: 'nonexistent-model',
        conversation_id: mockConversationId,
        serverURL: mockServerURL,
        query: "Hello",
      });
      expect(response.statusCode).toEqual(500);
    });
  });
});

import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import express from 'express';
import { APIError } from 'openai';
import request from 'supertest';

import { createRouter } from './router';

const mockCompletionsStream = jest.fn().mockImplementation(async function* () {
  const messages = [
    { content: 'Capital', idSuffix: '1' },
    { content: ' is', idSuffix: '2' },
    { content: ' Berlin', idSuffix: '3', finish_reason: 'stop' },
  ];

  for (const message of messages) {
    yield {
      id: `chatcmpl-863${message.idSuffix}`,
      object: 'chat.completion.chunk',
      model: 'test-model',
      system_fingerprint: 'fp_test_model',
      created: `172224834${message.idSuffix}`,
      choices: [
        {
          index: 0,
          delta: { role: 'assistant', content: message.content },
          finish_reason: message.finish_reason,
        },
      ],
    };
  }
});

jest.mock('openai', () => ({
  ...jest.requireActual('openai'),
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCompletionsStream,
      },
    },
  })),
}));

(global.fetch as jest.Mock) = jest.fn();

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      config: new ConfigReader({
        lightspeed: {
          baseURL: 'http://localhost:11434/v1/',
          apiKey: 'test-key',
        },
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

  describe('POST /completions', () => {
    it('streams completions', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .send({
          model: 'test-model',
          messages: [{ role: 'user', content: 'Hello' }],
        });
      const expectedData = [
        {
          created: '1722248341',
          message: { content: 'Capital', role: 'assistant' },
        },
        {
          created: '1722248342',
          message: { content: ' is', role: 'assistant' },
        },
        {
          created: '1722248343',
          message: { content: ' Berlin', role: 'assistant' },
        },
      ];
      const expectedText = expectedData
        .map(obj => JSON.stringify(obj))
        .join('');
      expect(response.statusCode).toEqual(200);
      expect(response.text).toContain(expectedText);
    });

    it('returns 400 if messages are missing', async () => {
      const response = await request(app).post('/chat/completions').send({
        model: 'test-model',
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe('Messages must be an array');
      expect(mockCompletionsStream).not.toHaveBeenCalled();
    });

    it('returns 400 if messages are not an array', async () => {
      const response = await request(app).post('/chat/completions').send({
        model: 'test-model',
        messages: {},
      });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe('Messages must be an array');
      expect(mockCompletionsStream).not.toHaveBeenCalled();
    });

    it('returns 400 if a message does not have a role', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .send({
          model: 'test-model',
          messages: [{ content: 'Hello' }],
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'Each message must have a role which is a non-empty string',
      );
      expect(mockCompletionsStream).not.toHaveBeenCalled();
    });

    it('returns 400 if a message does not have content', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .send({
          model: 'test-model',
          messages: [{ role: 'user' }],
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'Each message must have content which is a non-empty string',
      );
      expect(mockCompletionsStream).not.toHaveBeenCalled();
    });

    it('returns 400 if model is empty', async () => {
      const response = await request(app)
        .post('/chat/completions')
        .send({
          model: '',
          messages: [{ role: 'user', content: 'Hello' }],
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe(
        'Model is required and must be a non-empty string',
      );
      expect(mockCompletionsStream).not.toHaveBeenCalled();
    });

    it('returns openai error', async () => {
      mockCompletionsStream.mockImplementationOnce(async () => {
        throw APIError.generate(
          400,
          { error: 'invalid model' },
          'Invalid model',
          {},
        );
      });
      const response = await request(app)
        .post('/chat/completions')
        .send({
          model: 'nonexistent-model',
          messages: [{ role: 'user', content: 'Hello' }],
        });
      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toBe('400 "invalid model"');
    });

    it('returns 500 if unexpected error', async () => {
      mockCompletionsStream.mockImplementationOnce(async () => {
        throw new Error();
      });
      const response = await request(app)
        .post('/chat/completions')
        .send({
          model: 'nonexistent-model',
          messages: [{ role: 'user', content: 'Hello' }],
        });
      expect(response.statusCode).toEqual(500);
    });
  });
});

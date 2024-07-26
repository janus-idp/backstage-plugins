import { getVoidLogger } from '@backstage/backend-common';
import { ConfigReader } from '@backstage/config';

import express from 'express';
import request from 'supertest';

import { createRouter } from './router';

const mockCompletionsStream = async function* () {
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
};

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async () => {
            return mockCompletionsStream();
          }),
        },
      },
    };
  });
});

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
  });
});

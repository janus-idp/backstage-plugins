import { getVoidLogger } from '@backstage/backend-common';

import express from 'express';
import request from 'supertest';

import { createRouter } from './router';

const mockDatabaseManager = {
  getClient: jest.fn().mockImplementation(),
};

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const router = await createRouter({
      logger: getVoidLogger(),
      dbClient: mockDatabaseManager.getClient(),
    });
    app = express().use(router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('returns ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});

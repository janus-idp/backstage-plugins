import { getVoidLogger } from '@backstage/backend-common';

import express from 'express';
import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import request from 'supertest';

import { createRouter } from './router';

const db = Knex.knex({ client: MockClient });
db.client = {
  config: {
    connection: {
      database: 'test-database',
    },
  },
};

const mockDatabaseManager = {
  getClient: jest.fn().mockImplementation(async (): Promise<Knex.Knex> => {
    return db;
  }),
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

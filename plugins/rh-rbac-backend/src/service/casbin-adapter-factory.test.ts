import { ConfigReader } from '@backstage/config';

import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import sinon from 'sinon';
import TypeORMAdapter from 'typeorm-adapter';

import { CasbinAdapterFactory } from './casbin-adapter-factory';

describe('CasbinAdapterFactory', () => {
  it('test building an adapter using a better-sqlite3 configuration.', async () => {
    const mockDatabaseManager = {
      getClient: jest.fn().mockImplementation(),
    };
    const config = new ConfigReader({
      backend: {
        database: {
          client: 'better-sqlite3',
          connection: ':memory:',
        },
      },
    });
    const adapterFactory = new CasbinAdapterFactory(
      config,
      mockDatabaseManager,
    );
    const adapter = adapterFactory.createAdapter();
    expect(adapter).not.toBeNull();
  });

  //
  // Postgres doesn't support in-memory execution, but TypeORMAdapter.newAdapter
  // tries to connect to the real database.
  // In unit tests, it's a good idea to avoid using a database connection with non-in-memory storage.
  // Jest doesn't support stubbing code from external libraries,
  // so we can use Sinon for this purpose...
  //
  it('test building an adapter using a PostgreSQL configuration.', async () => {
    const mockAdapter: Partial<TypeORMAdapter> = {
      loadPolicy: sinon.stub().resolves(),
      savePolicy: sinon.stub().resolves(true),
      addPolicy: sinon.stub().resolves(),
      removePolicy: sinon.stub().resolves(),
      removeFilteredPolicy: sinon.stub().resolves(),
      isFiltered: sinon.stub().resolves(),
      close: sinon.stub().resolves(),
      loadFilteredPolicy: sinon.stub().resolves(),
      addPolicies: sinon.stub().resolves(),
      removePolicies: sinon.stub().resolves(),
    };

    const newAdapterStub = sinon
      .stub(TypeORMAdapter, 'newAdapter')
      .returns(Promise.resolve(mockAdapter as TypeORMAdapter));

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
    const config = new ConfigReader({
      backend: {
        database: {
          client: 'pg',
          connection: {
            host: 'localhost',
            port: '5432',
            user: 'postgresUser',
            password: 'test',
          },
        },
      },
    });
    const factory = new CasbinAdapterFactory(config, mockDatabaseManager);
    const adapter = await factory.createAdapter();
    expect(adapter).not.toBeNull();
    expect(newAdapterStub.calledOnce).toBe(true);
  });

  it('ensure that building an adapter with an unknown configuration fails.', async () => {
    const client = 'unknown-db';
    const expectedError = new Error(`Unsupported database client ${client}`);
    const mockDatabaseManager = {
      getClient: jest.fn().mockImplementation(),
    };
    const config = new ConfigReader({
      backend: {
        database: {
          client,
        },
      },
    });
    const adapterFactory = new CasbinAdapterFactory(
      config,
      mockDatabaseManager,
    );

    await expect(adapterFactory.createAdapter()).rejects.toStrictEqual(
      expectedError,
    );
  });
});

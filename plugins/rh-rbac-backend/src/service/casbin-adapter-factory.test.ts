import { ConfigReader } from '@backstage/config';

import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import TypeORMAdapter from 'typeorm-adapter';

import { CasbinAdapterFactory } from './casbin-adapter-factory';

jest.mock('typeorm-adapter', () => {
  return {
    newAdapter: jest.fn((): Promise<TypeORMAdapter> => {
      return Promise.resolve({} as TypeORMAdapter);
    }),
  };
});

describe('CasbinAdapterFactory', () => {
  let newAdapterMock: jest.Mock<Promise<TypeORMAdapter>>;

  beforeEach(() => {
    newAdapterMock = TypeORMAdapter.newAdapter as jest.Mock<
      Promise<TypeORMAdapter>
    >;
    jest.clearAllMocks();
  });
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
    expect(newAdapterMock).toHaveBeenCalled();
  });

  it('test building an adapter using a PostgreSQL configuration.', async () => {
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
    expect(newAdapterMock).toHaveBeenCalled();
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
    expect(newAdapterMock).not.toHaveBeenCalled();
  });
});

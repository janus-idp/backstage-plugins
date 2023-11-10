import { DatabaseService } from '@backstage/backend-plugin-api';
import { ConfigReader } from '@backstage/config';

import * as Knex from 'knex';
import { MockClient } from 'knex-mock-client';
import TypeORMAdapter from 'typeorm-adapter';

import { CasbinDBAdapterFactory } from './casbin-adapter-factory';

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
    const adapterFactory = new CasbinDBAdapterFactory(
      config,
      mockDatabaseManager,
    );
    const adapter = adapterFactory.createAdapter();
    expect(adapter).not.toBeNull();
    expect(newAdapterMock).toHaveBeenCalled();
  });

  describe('build adapter with postgres configuration', () => {
    let mockDatabaseManager: DatabaseService;

    beforeEach(() => {
      const db = Knex.knex({ client: MockClient });
      db.client = {
        config: {
          connection: {
            database: 'test-database',
          },
        },
      };
      mockDatabaseManager = {
        getClient: jest
          .fn()
          .mockImplementation(async (): Promise<Knex.Knex> => {
            return db;
          }),
      };
      process.env.TEST = 'test';
    });

    it('test building an adapter using a PostgreSQL configuration.', async () => {
      const config = new ConfigReader({
        backend: {
          database: {
            client: 'pg',
            connection: {
              host: 'localhost',
              port: '5432',
              user: 'postgresUser',
              password: process.env.TEST,
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, mockDatabaseManager);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: undefined,
      });
    });

    it('test building an adapter using a PostgreSQL configuration with enabled ssl.', async () => {
      const config = new ConfigReader({
        backend: {
          database: {
            client: 'pg',
            connection: {
              host: 'localhost',
              port: '5432',
              user: 'postgresUser',
              password: process.env.TEST,
              ssl: true,
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, mockDatabaseManager);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: true,
      });
    });

    it('test building an adapter using a PostgreSQL configuration with intentionally disabled ssl.', async () => {
      const config = new ConfigReader({
        backend: {
          database: {
            client: 'pg',
            connection: {
              host: 'localhost',
              port: '5432',
              user: 'postgresUser',
              password: process.env.TEST,
              ssl: false,
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, mockDatabaseManager);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: false,
      });
    });

    it('test building an adapter using a PostgreSQL configuration with intentionally ssl and ca cert.', async () => {
      const config = new ConfigReader({
        backend: {
          database: {
            client: 'pg',
            connection: {
              host: 'localhost',
              port: '5432',
              user: 'postgresUser',
              password: process.env.TEST,
              ssl: {
                ca: 'abc',
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, mockDatabaseManager);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgresUser',
        password: process.env.TEST,
        database: 'test-database',
        ssl: {
          ca: 'abc',
        },
      });
    });
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
    const adapterFactory = new CasbinDBAdapterFactory(
      config,
      mockDatabaseManager,
    );

    await expect(adapterFactory.createAdapter()).rejects.toStrictEqual(
      expectedError,
    );
    expect(newAdapterMock).not.toHaveBeenCalled();
  });
});

import { ConfigReader } from '@backstage/config';

import knex, { Knex } from 'knex';
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
  let db: Knex;

  beforeEach(() => {
    newAdapterMock = TypeORMAdapter.newAdapter as jest.Mock<
      Promise<TypeORMAdapter>
    >;
    jest.clearAllMocks();
  });
  it('test building an adapter using a better-sqlite3 configuration.', async () => {
    db = knex.knex({
      client: 'better-sqlite3',
      connection: ':memory',
    });
    const config = new ConfigReader({
      backend: {
        database: {
          client: 'better-sqlite3',
          connection: ':memory:',
        },
      },
    });
    const adapterFactory = new CasbinDBAdapterFactory(config, db);
    const adapter = adapterFactory.createAdapter();
    expect(adapter).not.toBeNull();
    expect(newAdapterMock).toHaveBeenCalled();
  });

  describe('build adapter with postgres configuration', () => {
    beforeEach(() => {
      db = knex.knex({
        client: 'pg',
        connection: {
          database: 'test-database',
        },
      });
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
              schema: 'public',
              user: 'postgresUser',
              password: process.env.TEST,
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
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
              schema: 'public',
              user: 'postgresUser',
              password: process.env.TEST,
              ssl: true,
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
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
              schema: 'public',
              user: 'postgresUser',
              password: process.env.TEST,
              ssl: false,
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
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
              schema: 'public',
              user: 'postgresUser',
              password: process.env.TEST,
              ssl: {
                ca: 'abc',
              },
            },
          },
        },
      });
      const factory = new CasbinDBAdapterFactory(config, db);
      const adapter = await factory.createAdapter();
      expect(adapter).not.toBeNull();
      expect(newAdapterMock).toHaveBeenCalledWith({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        schema: 'public',
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
    const config = new ConfigReader({
      backend: {
        database: {
          client,
        },
      },
    });
    const adapterFactory = new CasbinDBAdapterFactory(config, db);

    await expect(adapterFactory.createAdapter()).rejects.toStrictEqual(
      expectedError,
    );
    expect(newAdapterMock).not.toHaveBeenCalled();
  });
});

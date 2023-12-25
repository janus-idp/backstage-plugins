import { mockServices } from '@backstage/backend-test-utils';

import { initDB } from './db';

describe('db', () => {
  it('init ok', async () => {
    const dbClient = await initDB(
      mockServices.rootConfig({
        data: {
          client: 'better-sqlite3',
          connection: {
            filename: ':memory:',
          },
          useNullAsDefault: true,
        },
      }),
    );

    await Promise.all([
      dbClient.schema
        .hasTable('messages')
        .then(exists => expect(exists).toBeTruthy()),
      dbClient.schema
        .hasTable('users')
        .then(exists => expect(exists).toBeTruthy()),
      dbClient.schema
        .hasTable('groups')
        .then(exists => expect(exists).toBeTruthy()),
      dbClient.schema
        .hasTable('actions')
        .then(exists => expect(exists).toBeTruthy()),
    ]);

    expect(dbClient.client.config.connection.database).toEqual(
      'backstage_plugin_notifications',
    );

    await dbClient.destroy();
  });

  it('set DB name and knex config', async () => {
    const dbClient = await initDB(
      mockServices.rootConfig({
        data: {
          client: 'better-sqlite3',
          connection: {
            filename: ':memory:',
            database: 'testdb',
          },
          useNullAsDefault: true,
          knexConfig: {
            pool: {
              min: 1,
              max: 1,
            },
          },
        },
      }),
    );

    expect(dbClient.client.config.connection.database).toEqual('testdb');
    expect(dbClient.client.config.pool.min).toEqual(1);

    await dbClient.destroy();
  });

  it('set plugin config', async () => {
    const dbClient = await initDB(
      mockServices.rootConfig({
        data: {
          client: 'better-sqlite3',
          connection: {
            filename: ':memory:',
            database: 'testdb',
          },
          useNullAsDefault: true,
          knexConfig: {
            pool: {
              min: 1,
              max: 1,
            },
          },
          plugin: {
            notifications: {
              connection: {
                filename: 'plugin',
                database: 'plugin',
              },
              knexConfig: {
                pool: {
                  min: 3,
                  max: 3,
                },
              },
            },
          },
        },
      }),
    );

    expect(dbClient.client.config.connection.database).toEqual('plugin');
    expect(dbClient.client.config.connection.filename).toEqual('plugin');
    expect(dbClient.client.config.pool.min).toEqual(3);
    expect(dbClient.client.config.pool.max).toEqual(3);

    await dbClient.destroy();
  });
});

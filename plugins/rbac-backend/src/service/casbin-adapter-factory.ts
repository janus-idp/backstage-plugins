import { PluginDatabaseManager } from '@backstage/backend-common';
import { ConfigApi } from '@backstage/core-plugin-api';

import TypeORMAdapter from 'typeorm-adapter';

import { resolve } from 'path';

const DEFAULT_SQLITE3_STORAGE_FILE_NAME = 'rbac-backend.sqlite';

export class CasbinDBAdapterFactory {
  public constructor(
    private readonly config: ConfigApi,
    private readonly databaseManager: PluginDatabaseManager,
  ) {}

  public async createAdapter(): Promise<TypeORMAdapter> {
    const databaseConfig = this.config.getOptionalConfig('backend.database');
    const client = databaseConfig?.getOptionalString('client');

    let adapter;
    if (client === 'pg') {
      const knexClient = await this.databaseManager.getClient();
      const database = await knexClient.client.config.connection.database;
      adapter = await TypeORMAdapter.newAdapter({
        type: 'postgres',
        host: databaseConfig?.getString('connection.host'),
        port: databaseConfig?.getNumber('connection.port'),
        username: databaseConfig?.getString('connection.user'),
        password: databaseConfig?.getString('connection.password'),
        database,
      });
    }

    if (client === 'better-sqlite3') {
      let storage;
      if (typeof databaseConfig?.get('connection')?.valueOf() === 'string') {
        storage = databaseConfig?.getString('connection');
      } else if (databaseConfig?.has('connection.directory')) {
        const storageDir = databaseConfig?.getString('connection.directory');
        storage = resolve(storageDir, DEFAULT_SQLITE3_STORAGE_FILE_NAME);
      }

      adapter = await TypeORMAdapter.newAdapter({
        type: 'better-sqlite3',
        // Storage type or path to the storage.
        database: storage || ':memory:',
      });
    }

    if (!adapter) {
      throw new Error(`Unsupported database client ${client}`);
    }

    return adapter;
  }
}

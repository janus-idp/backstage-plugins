import { PluginDatabaseManager } from '@backstage/backend-common';
import { Config } from '@backstage/config';
import { ConfigApi } from '@backstage/core-plugin-api';

import TypeORMAdapter from 'typeorm-adapter';

import { resolve } from 'path';
import { TlsOptions } from 'tls';

const DEFAULT_SQLITE3_STORAGE_FILE_NAME = 'rbac.sqlite';

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
      const dbName = await knexClient.client.config.connection.database;

      const ssl = this.handleSSL(databaseConfig!);

      adapter = await TypeORMAdapter.newAdapter({
        type: 'postgres',
        host: databaseConfig?.getString('connection.host'),
        port: databaseConfig?.getNumber('connection.port'),
        username: databaseConfig?.getString('connection.user'),
        password: databaseConfig?.getString('connection.password'),
        ssl,
        database: dbName,
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

  private handleSSL(dbConfig: Config): boolean | TlsOptions | undefined {
    const connection = dbConfig.getOptional('connection');
    if (!connection) {
      return undefined;
    }
    const ssl = (connection as { ssl: Object | boolean | undefined }).ssl;

    if (ssl === undefined) {
      return undefined;
    }

    if (typeof ssl.valueOf() === 'boolean') {
      return ssl;
    }

    if (typeof ssl.valueOf() === 'object') {
      const ca = (ssl as { ca: string }).ca;
      if (ca) {
        return { ca };
      }
      // SSL object was defined with some options that we don't support yet.
      return true;
    }

    return undefined;
  }
}

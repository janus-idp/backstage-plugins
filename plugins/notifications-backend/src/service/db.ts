import { Config } from '@backstage/config';

import knex, { Knex } from 'knex';

// initDB
// creates DB client and tables
export async function initDB(dbConfig: Config): Promise<Knex<any, any>> {
  // create db client
  const dbClient = knex({
    client: dbConfig.getString('client'),
    connection: {
      host: dbConfig.getString('connection.host'),
      port: dbConfig.getNumber('connection.port'),
      user: dbConfig.getString('connection.user'),
      password: dbConfig.getString('connection.password'),
      database: 'backstage_plugin_notifications',
    },
  });

  // create tables
  if (!(await dbClient.schema.hasTable('messages'))) {
    await dbClient.schema.createTable('messages', table => {
      table.uuid('id', { primaryKey: true }).defaultTo(dbClient.fn.uuid());
      table.string('origin').notNullable();
      table.timestamp('created').defaultTo(dbClient.fn.now());
      table.string('title').notNullable();
      table.text('message');
      table.string('topic');
    });
  }

  if (!(await dbClient.schema.hasTable('actions'))) {
    await dbClient.schema.createTable('actions', table => {
      table.uuid('id', { primaryKey: true }).defaultTo(dbClient.fn.uuid());
      table.uuid('message_id').notNullable();
      table.foreign('message_id').references('id').inTable('messages');
      table.string('url').notNullable();
      table.string('title').notNullable();
    });
  }

  return dbClient;
}

export type MessagesInsert = {
  origin: string;
  title: string;
  message?: string;
  topic?: string;
};

export type ActionsInsert = {
  message_id: string;
  title: string;
  url: string;
};

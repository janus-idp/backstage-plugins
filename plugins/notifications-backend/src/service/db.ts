import { Config } from '@backstage/config';

import knex, { Knex } from 'knex';
import merge from 'lodash/merge';

// initDB
// creates DB client and tables
export async function initDB(dbConfig: Config): Promise<Knex<any, any>> {
  // create db client
  const knexConfig = merge(
    {},
    { connection: { database: 'backstage_plugin_notifications' } },
    dbConfig.getOptional('plugin.notifications'),
    dbConfig.getOptional('plugin.notifications.knexConfig'),
    dbConfig.get(),
    dbConfig.getOptional('knexConfig'),
    dbConfig.getOptional('plugin.notifications'),
    dbConfig.getOptional('plugin.notifications.knexConfig'),
  );
  const dbClient = knex(knexConfig);

  // create tables
  if (!(await dbClient.schema.hasTable('messages'))) {
    await dbClient.schema.createTable('messages', table => {
      table.uuid('id').primary().notNullable().defaultTo(dbClient.fn.uuid());
      table.string('origin').notNullable();
      table.string('created').index(); // ISO 8601 date-time string
      table.string('title').notNullable();
      table.text('message');
      table.string('topic');
      table.boolean('is_system').notNullable().index(); // is it a system message or a message for specific users and groups
    });
  }

  if (!(await dbClient.schema.hasTable('users'))) {
    await dbClient.schema.createTable('users', table => {
      table.uuid('message_id').notNullable().index();
      table.string('user').notNullable().index();
      table.boolean('read').defaultTo('false');
      table
        .foreign('message_id')
        .references('id')
        .inTable('messages')
        .onDelete('CASCADE');
      table.primary(['message_id', 'user']);
    });
  }

  if (!(await dbClient.schema.hasTable('groups'))) {
    await dbClient.schema.createTable('groups', table => {
      table.uuid('message_id').notNullable().index();
      table.string('group').notNullable().index();
      table
        .foreign('message_id')
        .references('id')
        .inTable('messages')
        .onDelete('CASCADE');
      table.primary(['message_id', 'group']);
    });
  }

  if (!(await dbClient.schema.hasTable('actions'))) {
    await dbClient.schema.createTable('actions', table => {
      table.uuid('id', { primaryKey: true }).defaultTo(dbClient.fn.uuid());
      table.uuid('message_id').notNullable().index();
      table
        .foreign('message_id')
        .references('id')
        .inTable('messages')
        .onDelete('CASCADE');
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
  is_system: boolean;
  created: string;
};

export type ActionsInsert = {
  message_id: string;
  title: string;
  url: string;
};

export function dbValToBoolean(val: any): boolean {
  if (!val) {
    return false;
  }

  const valStr = val.toString();

  switch (valStr) {
    case 'true':
    case 'TRUE':
    case '1':
      return true;
    case 'false':
    case 'FALSE':
    case '0':
      return false;
    default:
      throw new Error(`${valStr} is not a boolean value`);
  }
}

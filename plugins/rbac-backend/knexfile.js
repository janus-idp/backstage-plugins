// This file makes it possible to create new migration files and execute migration.
// To create new migration file use: "yarn knex migrate:make migrations",
// open generated new migration file and edit it to complete code.
// To run new migration use: "yarn knex migrate:make some_file_name"

module.exports = {
  client: 'better-sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
  migrations: {
    directory: './migrations',
  },
};

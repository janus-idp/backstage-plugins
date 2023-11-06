/**
 * up - runs migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('policy-conditions', table => {
    table.increments('id').primary();
    table.string('result');
    table.string('pluginId');
    table.string('resourceType');
    // Conditions is potentially long json.
    // In the future maybe we can use `json` or `jsonb` type instead of `text`:
    // table.json('conditions') or table.jsonb('conditions').
    // But let's start with text type.
    // Data type "text" can be unlimited by size for Postgres.
    // Also postgres has a lot of build in features for this data type.
    table.text('conditionsJson');
  });
};

/**
 * down - reverts(undo) migration.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('policy-conditions');
};

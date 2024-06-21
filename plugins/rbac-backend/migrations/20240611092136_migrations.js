/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const policyMetadataExist = await knex.schema.hasTable('policy-metadata');

  if (policyMetadataExist) {
    await knex.schema.dropTable('policy-metadata');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function down(_knex) {};

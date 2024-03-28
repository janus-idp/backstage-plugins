/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const policyConditionsExist = await knex.schema.hasTable('policy-conditions');

  if (policyConditionsExist) {
    // We drop policy condition table, because we decided to rework this feature
    // and bound policy condition to the role
    await knex.schema.dropTable('policy-conditions');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(_knex) {};

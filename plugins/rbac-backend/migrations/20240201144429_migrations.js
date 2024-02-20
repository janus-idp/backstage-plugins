/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const isRoleMetaDataExist = await knex.schema.hasTable('role-metadata');
  if (isRoleMetaDataExist) {
    await knex.schema.alterTable('role-metadata', table => {
      table.string('description');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  const isRoleMetaDataExist = await knex.schema.hasTable('role-metadata');
  if (isRoleMetaDataExist) {
    await knex.schema.alterTable('role-metadata', table => {
      table.dropColumn('description');
    });
  }
};

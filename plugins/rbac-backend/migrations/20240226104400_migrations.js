/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const isRoleMetaDataExist = await knex.schema.hasTable('role-metadata');
  if (isRoleMetaDataExist) {
    await knex.schema.alterTable('role-metadata', table => {
      table.string('author');
      table.string('modifiedBy');
      table.dateTime('createdAt');
      table.dateTime('lastModified');
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
      table.dropColumn('author');
      table.dropColumn('modifiedBy');
      table.dropColumn('createdAt');
      table.dropColumn('lastModified');
    });
  }
};

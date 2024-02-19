/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const casbinDoesExist = await knex.schema.hasTable('casbin_rule');
  const roleMetadataDoesExist = await knex.schema.hasTable('role-metadata');
  const groupPolicies = new Set();

  if (casbinDoesExist && !roleMetadataDoesExist) {
    await knex
      .select('*')
      .from('casbin_rule')
      .where('ptype', 'g')
      .then(listGroupPolicies => {
        for (const groupPolicy of listGroupPolicies) {
          const { v1 } = groupPolicy;
          groupPolicies.add(v1);
        }
      });

    await knex.schema
      .createTable('role-metadata', table => {
        table.increments('id').primary();
        table.string('roleEntityRef').primary();
        table.string('source');
      })
      .then(async () => {
        const metadata = [];
        for (const groupPolicy of groupPolicies) {
          metadata.push({ source: 'legacy', roleEntityRef: groupPolicy });
        }
        await knex.table('role-metadata').insert(metadata);
      });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('role-metadata');
};

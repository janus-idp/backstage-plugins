/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const casbinDoesExist = await knex.schema.hasTable('casbin_rule');
  let groupPolicies = [];

  if (casbinDoesExist) {
    groupPolicies = await knex
      .select('*')
      .from('casbin_rule')
      .where('ptype', 'g')
      .then(listGroupPolicies => {
        const allGroupPolicies = [];
        for (const groupPolicy of listGroupPolicies) {
          const { v1 } = groupPolicy;
          allGroupPolicies.push(v1);
        }
        return allGroupPolicies;
      });
  }

  await knex.schema
    .createTable('role-metadata', table => {
      table.increments('id').primary();
      table.string('roleEntityRef').primary();
      table.string('source');
    })
    .then(async () => {
      for (const groupPolicy of groupPolicies) {
        await knex
          .table('role-metadata')
          .insert({ source: 'legacy', roleEntityRef: groupPolicy });
      }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('role-metadata');
};

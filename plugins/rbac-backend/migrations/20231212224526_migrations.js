/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const casbinDoesExist = await knex.schema.hasTable('casbin_rule');
  let policies = [];
  let groupPolicies = [];

  if (casbinDoesExist) {
    policies = await knex
      .select('*')
      .from('casbin_rule')
      .where('ptype', 'p')
      .then(listPolicies => {
        const allPolicies = [];
        for (const policy of listPolicies) {
          const { v0, v1, v2, v3 } = policy;
          allPolicies.push(`[${v0}, ${v1}, ${v2}, ${v3}]`);
        }
        return allPolicies;
      });
    groupPolicies = await knex
      .select('*')
      .from('casbin_rule')
      .where('ptype', 'g')
      .then(listGroupPolicies => {
        const allGroupPolicies = [];
        for (const groupPolicy of listGroupPolicies) {
          const { v0, v1 } = groupPolicy;
          allGroupPolicies.push(`[${v0}, ${v1}]`);
        }
        return allGroupPolicies;
      });
  }

  await knex.schema
    .createTable('policy-metadata', table => {
      table.increments('id').primary();
      table.string('policy').primary();
      table.string('source');
    })
    .then(async () => {
      for (const policy of policies) {
        await knex
          .table('policy-metadata')
          .insert({ source: 'legacy', policy: policy });
      }
    })
    .then(async () => {
      for (const groupPolicy of groupPolicies) {
        await knex
          .table('policy-metadata')
          .insert({ source: 'legacy', policy: groupPolicy });
      }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('policy-metadata');
};

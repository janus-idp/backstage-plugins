/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const casbinDoesExist = await knex.schema.hasTable('casbin_rule');
  const policyMetadataDoesExist = await knex.schema.hasTable('policy-metadata');
  let policies = [];
  let groupPolicies = [];

  if (casbinDoesExist && !policyMetadataDoesExist) {
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

    await knex.schema
      .createTable('policy-metadata', table => {
        table.increments('id').primary();
        table.string('policy').primary();
        table.string('source');
      })
      .then(async () => {
        const metadata = [];
        for (const policy of policies) {
          metadata.push({ source: 'legacy', policy: policy });
        }
        await knex.table('policy-metadata').insert(metadata);
      })
      .then(async () => {
        const metadata = [];
        for (const groupPolicy of groupPolicies) {
          metadata.push({ source: 'legacy', policy: groupPolicy });
        }
        await knex.table('policy-metadata').insert(metadata);
      });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('policy-metadata');
};

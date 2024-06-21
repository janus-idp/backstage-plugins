/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function up(knex) {
  const policyMetadataExist = await knex.schema.hasTable('policy-metadata');

  if (policyMetadataExist) {
    // Fetch all necessary data in a single query
    const existingPoliciesSet = await knex('casbin_rule').select(
      'id',
      'ptype',
      'v0',
      'v1',
      'v2',
      'v3',
    );
    const policyStrings = existingPoliciesSet.map(p => ({
      id: p.id,
      policyString:
        p.ptype === 'p'
          ? `[${p.v0}, ${p.v1}, ${p.v2}, ${p.v3}]`
          : `[${p.v0}, ${p.v1}]`,
      ptype: p.ptype,
    }));

    const metadataRecords = await knex('policy-metadata')
      .whereIn(
        'policy',
        policyStrings.map(p => p.policyString),
      )
      .select('policy', 'source');

    const metadataMap = metadataRecords.reduce((map, record) => {
      map[record.policy] = record.source;
      return map;
    }, {});

    const updates = policyStrings
      .filter(p => metadataMap[p.policyString])
      .map(p => ({
        id: p.id,
        updateFields:
          p.ptype === 'p'
            ? { v4: metadataMap[p.policyString] }
            : { v2: metadataMap[p.policyString] },
      }));

    // Perform batch updates
    for (const { id, updateFields } of updates) {
      await knex('casbin_rule').where('id', id).update(updateFields);
    }

    await knex.schema.dropTable('policy-metadata');
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function down(_knex) {};

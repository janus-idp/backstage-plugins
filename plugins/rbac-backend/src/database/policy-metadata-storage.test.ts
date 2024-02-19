import { PluginDatabaseManager } from '@backstage/backend-common';
import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';

import * as Knex from 'knex';
import { createTracker, MockClient } from 'knex-mock-client';

import { PermissionPolicyMetadata } from '@janus-idp/backstage-plugin-rbac-common';

import { policyToString } from '../helper';
import { migrate } from './migration';
import {
  DataBasePolicyMetadataStorage,
  PermissionPolicyMetadataDao,
  POLICY_METADATA_TABLE,
} from './policy-metadata-storage';

jest.setTimeout(60000);

describe('policy-metadata-db-table', () => {
  const policy = ['role:default/team-a', 'catalog-entity', 'read', 'allow'];
  const policyStr = policyToString(policy);
  const databases = TestDatabases.create({
    ids: ['POSTGRES_13', 'SQLITE_3'],
  });

  async function createDatabase(databaseId: TestDatabaseId) {
    const knex = await databases.init(databaseId);
    const databaseManagerMock: PluginDatabaseManager = {
      getClient: jest.fn(() => {
        return Promise.resolve(knex);
      }),
      migrations: { skip: false },
    };
    await knex.schema.createTable('casbin_rule', table => {
      table.increments('id').primary();
      table.string('ptype');
      table.string('v0');
      table.string('v1');
      table.string('v2');
      table.string('v3');
      table.string('v4');
      table.string('v5');
      table.string('v6');
    });
    await migrate(databaseManagerMock);
    return {
      knex,
      db: new DataBasePolicyMetadataStorage(knex),
    };
  }

  describe('findPolicyMetadataBySource', () => {
    it.each(databases.eachSupportedId())(
      'should return found metadata by source',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);
        await knex<PermissionPolicyMetadataDao>(POLICY_METADATA_TABLE).insert({
          policy: policyStr,
          source: 'rest',
        });

        const trx = await knex.transaction();
        let metadata: PermissionPolicyMetadata[];
        try {
          metadata = await db.findPolicyMetadataBySource('rest', trx);
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
        expect(metadata.length).toEqual(1);
        expect(metadata[0]).toEqual({
          id: 1,
          source: 'rest',
          policy: policyStr,
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should return an empty array',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);

        const trx = await knex.transaction();
        let metadata: PermissionPolicyMetadata[];
        try {
          metadata = await db.findPolicyMetadataBySource('rest', trx);
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
        expect(metadata.length).toEqual(0);
      },
    );
  });

  describe('findPolicyMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should return undefined',
      async databasesId => {
        const { db } = await createDatabase(databasesId);

        const metadata = await db.findPolicyMetadata(policy);
        expect(metadata).toBeUndefined();
      },
    );

    it.each(databases.eachSupportedId())(
      'should return found metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<PermissionPolicyMetadataDao>(POLICY_METADATA_TABLE).insert({
          policy: policyStr,
          source: 'rest',
        });

        const metadata = await db.findPolicyMetadata(policy);
        expect(metadata).not.toBeUndefined();
        expect(metadata).toEqual({ source: 'rest' });
      },
    );
  });

  describe('createPolicyMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should successfully create new policy metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const trx = await knex.transaction();
        let id;
        try {
          id = await db.createPolicyMetadata('rest', policy, trx);
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
        const metadata = await knex<PermissionPolicyMetadataDao>(
          POLICY_METADATA_TABLE,
        ).where('id', id);
        expect(metadata.length).toEqual(1);
        expect(metadata[0]).toEqual({
          id: 1,
          policy: '[role:default/team-a, catalog-entity, read, allow]',
          source: 'rest',
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should throw conflict error',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<PermissionPolicyMetadataDao>(POLICY_METADATA_TABLE).insert({
          policy: policyStr,
          source: 'rest',
        });

        await expect(async () => {
          const trx = await knex.transaction();
          try {
            await db.createPolicyMetadata('rest', policy, trx);
            await trx.commit();
          } catch (err) {
            await trx.rollback(err);
            throw err;
          }
        }).rejects.toThrow(
          `A metadata for policy '${policyStr}' has already been stored`,
        );
      },
    );

    it('should throw failed to create metadata error, because inserted result is undefined', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(POLICY_METADATA_TABLE).response(undefined);
      tracker.on.insert(POLICY_METADATA_TABLE).response(undefined);

      const db = new DataBasePolicyMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.createPolicyMetadata('rest', policy, trx);
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow(
        `Failed to create the policy metadata: '{"source":"rest","policy":"[role:default/team-a, catalog-entity, read, allow]"}'.`,
      );
    });

    it('should throw an error on insert metadata operaton', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(POLICY_METADATA_TABLE).response(undefined);
      tracker.on
        .insert(POLICY_METADATA_TABLE)
        .simulateError('connection refused error');

      const db = new DataBasePolicyMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.createPolicyMetadata('rest', policy, trx);
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow('connection refused error');
    });
  });

  describe('removePolicyMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should successfully delete metadata',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);

        await knex<PermissionPolicyMetadataDao>(POLICY_METADATA_TABLE).insert({
          policy: policyStr,
          source: 'rest',
        });

        const trx = await knex.transaction();
        try {
          await db.removePolicyMetadata(policy, trx);
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
        }

        const metadata = await knex<PermissionPolicyMetadataDao>(
          POLICY_METADATA_TABLE,
        ).where('id', 1);
        expect(metadata.length).toEqual(0);
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to delete metadata, because nothing to delete',
      async databaseId => {
        const { knex, db } = await createDatabase(databaseId);

        await expect(async () => {
          const trx = await knex.transaction();
          try {
            await db.removePolicyMetadata(policy, trx);
            await trx.commit();
          } catch (err) {
            await trx.rollback(err);
            throw err;
          }
        }).rejects.toThrow(
          `A metadata for policy '${policyStr}' was not found`,
        );
      },
    );

    it('should throw an error on delete metadata operation', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(POLICY_METADATA_TABLE).response({
        policy: policyStr,
        source: 'rest',
        id: 1,
      });
      tracker.on
        .delete(POLICY_METADATA_TABLE)
        .simulateError('connection refused error');

      const db = new DataBasePolicyMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.removePolicyMetadata(policy, trx);
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow('connection refused error');
    });
  });
});

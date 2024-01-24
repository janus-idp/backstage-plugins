import { PluginDatabaseManager } from '@backstage/backend-common';
import { TestDatabaseId, TestDatabases } from '@backstage/backend-test-utils';

import * as Knex from 'knex';
import { createTracker, MockClient } from 'knex-mock-client';

import { migrate } from './migration';
import {
  DataBaseRoleMetadataStorage,
  ROLE_METADATA_TABLE,
  RoleMetadataDao,
} from './role-metadata';

describe('role-metadata-db-table', () => {
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
    await migrate(databaseManagerMock);
    return {
      knex,
      db: new DataBaseRoleMetadataStorage(knex),
    };
  }

  describe('findRoleMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should return undefined',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        const trx = await knex.transaction();
        try {
          const roleMetadata = await db.findRoleMetadata(
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
          expect(roleMetadata).toBeUndefined();
        } catch (err) {
          await trx.rollback();
          throw err;
        }
      },
    );

    it.each(databases.eachSupportedId())(
      'should return found metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);
        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'rest',
        });

        const trx = await knex.transaction();
        try {
          const roleMetadata = await db.findRoleMetadata(
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
          expect(roleMetadata).toEqual({ source: 'rest' });
        } catch (err) {
          await trx.rollback();
          throw err;
        }
      },
    );
  });

  describe('createRoleMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should successfully create new role metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        const trx = await knex.transaction();
        let id;
        try {
          id = await db.createRoleMetadata(
            { source: 'configuration' },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback();
          throw err;
        }

        const metadata = await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).where(
          'id',
          id,
        );
        expect(metadata.length).toEqual(1);
        expect(metadata[0]).toEqual({
          roleEntityRef: 'role:default/some-super-important-role',
          id: 1,
          source: 'configuration',
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should throw conflict error',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'configuration',
        });

        const trx = await knex.transaction();
        await expect(async () => {
          try {
            await db.createRoleMetadata(
              { source: 'configuration' },
              'role:default/some-super-important-role',
              trx,
            );
            await trx.commit();
          } catch (err) {
            await trx.rollback();
            throw err;
          }
        }).rejects.toThrow(
          `A metadata for role role:default/some-super-important-role has already been stored`,
        );
      },
    );

    it('should throw failed to create metadata error, because inserted result is an empty array.', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response(undefined);
      tracker.on.insert(ROLE_METADATA_TABLE).response([]);

      const db = new DataBaseRoleMetadataStorage(knex);
      const trx = await knex.transaction();

      await expect(
        db.createRoleMetadata(
          { source: 'configuration' },
          'role:default/some-super-important-role',
          trx,
        ),
      ).rejects.toThrow(
        `Failed to create the role metadata: '{"roleEntityRef":"role:default/some-super-important-role","source":"configuration"}'.`,
      );
    });

    it('should throw failed to create metadata error, because inserted result is undefined.', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response(undefined);
      tracker.on.insert(ROLE_METADATA_TABLE).response(undefined);

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.createRoleMetadata(
            { source: 'configuration' },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow(
        `Failed to create the role metadata: '{"roleEntityRef":"role:default/some-super-important-role","source":"configuration"}'.`,
      );
    });

    it('should throw an error on insert metadata operation', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response(undefined);
      tracker.on
        .insert(ROLE_METADATA_TABLE)
        .simulateError('connection refused error');

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.createRoleMetadata(
            { source: 'configuration' },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow('connection refused error');
    });
  });

  describe('updateRoleMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should successfully update role metadata from legacy source to new value',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'legacy',
        });

        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/some-super-important-role',
              source: 'rest',
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback();
          throw err;
        }

        const metadata = await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).where(
          'id',
          1,
        );
        expect(metadata.length).toEqual(1);
        expect(metadata[0]).toEqual({
          source: 'rest',
          roleEntityRef: 'role:default/some-super-important-role',
          id: 1,
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update role metadata source to new value, because source is not legacy',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'rest',
        });

        await expect(async () => {
          const trx = await knex.transaction();
          try {
            await db.updateRoleMetadata(
              {
                roleEntityRef: 'role:default/some-super-important-role',
                source: 'configuration',
              },
              'role:default/some-super-important-role',
              trx,
            );
            await trx.commit();
          } catch (err) {
            await trx.rollback();
            throw err;
          }
        }).rejects.toThrow(`The RoleMetadata.source field is 'read-only'`);
      },
    );

    it.each(databases.eachSupportedId())(
      'should successfully update role metadata with the new name',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'configuration',
        });

        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/important-role',
              source: 'configuration',
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback();
          throw err;
        }

        const metadata = await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).where(
          'id',
          1,
        );
        expect(metadata.length).toEqual(1);
        expect(metadata[0]).toEqual({
          source: 'configuration',
          roleEntityRef: 'role:default/important-role',
          id: 1,
        });
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to update role metadata, because role metadata was not found',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await expect(async () => {
          const trx = await knex.transaction();
          try {
            await db.updateRoleMetadata(
              {
                roleEntityRef: 'role:default/important-role',
                source: 'configuration',
              },
              'role:default/some-super-important-role',
              trx,
            );
            await trx.commit();
          } catch (err) {
            await trx.rollback();
            throw err;
          }
        }).rejects.toThrow(
          `A metadata for role 'role:default/some-super-important-role' was not found`,
        );
      },
    );

    it('should throw failed to update metadata error, because update result is an empty array.', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response({
        roleEntityRef: 'role:default/some-super-important-role',
        source: 'configuration',
        id: 1,
      });
      tracker.on.update(ROLE_METADATA_TABLE).response([]);

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/important-role',
              source: 'configuration',
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow(
        `Failed to update the role metadata '{"roleEntityRef":"role:default/some-super-important-role","source":"configuration","id":1}' with new value: '{"roleEntityRef":"role:default/important-role","source":"configuration"}'.`,
      );
    });

    it('should throw failed to update metadata error, because update result is undefined.', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response({
        roleEntityRef: 'role:default/some-super-important-role',
        source: 'configuration',
        id: 1,
      });
      tracker.on.update(ROLE_METADATA_TABLE).response(undefined);

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/important-role',
              source: 'configuration',
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow(
        `Failed to update the role metadata '{"roleEntityRef":"role:default/some-super-important-role","source":"configuration","id":1}' with new value: '{"roleEntityRef":"role:default/important-role","source":"configuration"}'.`,
      );
    });

    it('should throw on insert metadata operation', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response({
        roleEntityRef: 'role:default/some-super-important-role',
        source: 'configuration',
        id: 1,
      });
      tracker.on
        .update(ROLE_METADATA_TABLE)
        .simulateError('connection refused error');

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.updateRoleMetadata(
            {
              roleEntityRef: 'role:default/important-role',
              source: 'configuration',
            },
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow('connection refused error');
    });
  });

  describe('removeRoleMetadata', () => {
    it.each(databases.eachSupportedId())(
      'should successfully delete role metadata',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).insert({
          roleEntityRef: 'role:default/some-super-important-role',
          source: 'legacy',
        });

        const trx = await knex.transaction();
        try {
          await db.removeRoleMetadata(
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback();
          throw err;
        }

        const metadata = await knex<RoleMetadataDao>(ROLE_METADATA_TABLE).where(
          'id',
          1,
        );
        expect(metadata.length).toEqual(0);
      },
    );

    it.each(databases.eachSupportedId())(
      'should fail to delete role metadata, because nothing to delete',
      async databasesId => {
        const { knex, db } = await createDatabase(databasesId);

        const trx = await knex.transaction();

        await expect(async () => {
          try {
            await db.removeRoleMetadata(
              'role:default/some-super-important-role',
              trx,
            );
            await trx.commit();
          } catch (err) {
            await trx.rollback();
            throw err;
          }
        }).rejects.toThrow(
          `A metadata for role 'role:default/some-super-important-role' was not found`,
        );
      },
    );

    it('should throw an error on delete metadata operation', async () => {
      const knex = Knex.knex({ client: MockClient });
      const tracker = createTracker(knex);
      tracker.on.select(ROLE_METADATA_TABLE).response({
        roleEntityRef: 'role:default/some-super-important-role',
        source: 'configuration',
        id: 1,
      });
      tracker.on
        .delete(ROLE_METADATA_TABLE)
        .simulateError('connection refused error');

      const db = new DataBaseRoleMetadataStorage(knex);

      await expect(async () => {
        const trx = await knex.transaction();
        try {
          await db.removeRoleMetadata(
            'role:default/some-super-important-role',
            trx,
          );
          await trx.commit();
        } catch (err) {
          await trx.rollback(err);
          throw err;
        }
      }).rejects.toThrow('connection refused error');
    });
  });
});

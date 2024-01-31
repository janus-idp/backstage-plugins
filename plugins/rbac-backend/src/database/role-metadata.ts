import { ConflictError, InputError, NotFoundError } from '@backstage/errors';

import { Knex } from 'knex';

import { RoleMetadata } from '@janus-idp/backstage-plugin-rbac-common';

export const ROLE_METADATA_TABLE = 'role-metadata';

export interface RoleMetadataDao extends RoleMetadata {
  id?: number;
  roleEntityRef: string;
}

export interface RoleMetadataStorage {
  findRoleMetadata(
    roleEntityRef: string,
    trx?: Knex.Transaction,
  ): Promise<RoleMetadata | undefined>;
  createRoleMetadata(
    roleMetadata: RoleMetadata,
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<number>;
  updateRoleMetadata(
    roleMetadata: RoleMetadataDao,
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void>;
  removeRoleMetadata(
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void>;
}

export class DataBaseRoleMetadataStorage implements RoleMetadataStorage {
  constructor(private readonly knex: Knex<any, any[]>) {}

  async findRoleMetadata(
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<RoleMetadata | undefined> {
    const roleMetadataDao = await this.findRoleMetadataDao(roleEntityRef, trx);
    if (roleMetadataDao) {
      return this.daoToMetadata(roleMetadataDao);
    }
    return undefined;
  }

  private async findRoleMetadataDao(
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<RoleMetadataDao | undefined> {
    const db = trx || this.knex;
    return await db
      .table(ROLE_METADATA_TABLE)
      .where('roleEntityRef', roleEntityRef)
      // roleEntityRef should be unique.
      .first();
  }

  async createRoleMetadata(
    roleMetadata: RoleMetadata,
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<number> {
    if (await this.findRoleMetadataDao(roleEntityRef, trx)) {
      throw new ConflictError(
        `A metadata for role ${roleEntityRef} has already been stored`,
      );
    }

    const metadataDao = this.metadataToDao(roleMetadata, roleEntityRef);
    const result = await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .insert(metadataDao)
      .returning<[{ id: number }]>('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(
      `Failed to create the role metadata: '${JSON.stringify(metadataDao)}'.`,
    );
  }

  async updateRoleMetadata(
    newRoleMetadataDao: RoleMetadataDao,
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void> {
    const currentMetadataDao = await this.findRoleMetadataDao(
      roleEntityRef,
      trx,
    );

    if (!currentMetadataDao) {
      throw new NotFoundError(
        `A metadata for role '${roleEntityRef}' was not found`,
      );
    }

    if (
      currentMetadataDao.source !== 'legacy' &&
      currentMetadataDao.source !== newRoleMetadataDao.source
    ) {
      throw new InputError(`The RoleMetadata.source field is 'read-only'.`);
    }

    const result = await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .where('id', currentMetadataDao.id)
      .update(newRoleMetadataDao)
      .returning('id');

    if (!result || result.length === 0) {
      throw new Error(
        `Failed to update the role metadata '${JSON.stringify(
          currentMetadataDao,
        )}' with new value: '${JSON.stringify(newRoleMetadataDao)}'.`,
      );
    }
  }

  async removeRoleMetadata(
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void> {
    const metadataDao = await this.findRoleMetadataDao(roleEntityRef, trx);
    if (!metadataDao) {
      throw new NotFoundError(
        `A metadata for role '${roleEntityRef}' was not found`,
      );
    }

    await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .delete()
      .whereIn('id', [metadataDao.id!]);
  }

  private daoToMetadata(dao: RoleMetadataDao): RoleMetadata {
    return {
      source: dao.source,
    };
  }

  private metadataToDao(
    roleMetadata: RoleMetadata,
    roleEntityRef: string,
  ): RoleMetadataDao {
    return {
      roleEntityRef,
      source: roleMetadata.source,
    };
  }
}

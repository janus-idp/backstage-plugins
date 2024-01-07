import { ConflictError, InputError, NotFoundError } from '@backstage/errors';

import { Knex } from 'knex';

import { RoleMetadata } from '@janus-idp/backstage-plugin-rbac-common';

const ROLE_METADATA_TABLE = 'role-metadata';

interface RoleMetadataDao extends RoleMetadata {
  id?: number;
  roleEntityRef: string;
}

export interface RoleMetadataStorage {
  findRoleMetadata(roleEntityRef: string): Promise<RoleMetadata | undefined>;
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
  ): Promise<RoleMetadata | undefined> {
    const roleMetadataDao = await this.findRoleMetadataDao(roleEntityRef);
    if (roleMetadataDao) {
      return this.daoToMetadata(roleMetadataDao);
    }
    return undefined;
  }

  private async findRoleMetadataDao(
    roleEntityRef: string,
  ): Promise<RoleMetadataDao | undefined> {
    const metadataDao = await this.knex
      .table(ROLE_METADATA_TABLE)
      .where('roleEntityRef', roleEntityRef)
      // roleEntityRef should be unique.
      .first();

    return metadataDao;
  }

  async createRoleMetadata(
    roleMetadata: RoleMetadata,
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<number> {
    if (await this.findRoleMetadataDao(roleEntityRef)) {
      throw new ConflictError(
        `A metadata for role ${roleEntityRef} has already been stored`,
      );
    }

    const metadataDao = this.metadataToDao(roleMetadata, roleEntityRef);
    const result = await trx
      .table(ROLE_METADATA_TABLE)
      .insert<RoleMetadataDao>(metadataDao)
      .returning('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(`Failed to create the role metadata.`);
  }

  async updateRoleMetadata(
    newRoleMetadataDao: RoleMetadataDao,
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void> {
    const currentMetadataDao = await this.findRoleMetadataDao(roleEntityRef);

    if (!currentMetadataDao) {
      throw new NotFoundError(
        `A metadata for role ${roleEntityRef} was not found`,
      );
    }

    if (currentMetadataDao.source !== newRoleMetadataDao.source) {
      throw new InputError(`The RoleMetadata.source field is 'read-only'`);
    }

    console.log(
      `${currentMetadataDao.roleEntityRef} and ${newRoleMetadataDao.roleEntityRef}`,
    );
    if (currentMetadataDao.roleEntityRef !== newRoleMetadataDao.roleEntityRef) {
      console.log('============');
      const result = await trx
        .table(ROLE_METADATA_TABLE)
        .where('id', currentMetadataDao.id)
        .update<RoleMetadataDao>(newRoleMetadataDao)
        .returning('id');

      if (!result || result.length === 0) {
        throw new Error(
          `Failed to update the role metadata for role: ${currentMetadataDao.roleEntityRef}.`,
        );
      }
    }
  }

  async removeRoleMetadata(
    roleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void> {
    const metadataDao = await this.findRoleMetadataDao(roleEntityRef);
    if (!metadataDao) {
      throw new NotFoundError(
        `A metadata for role ${roleEntityRef} was not found`,
      );
    }

    await trx
      .table(ROLE_METADATA_TABLE)
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

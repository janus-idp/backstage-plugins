import { ConflictError, InputError, NotFoundError } from '@backstage/errors';

import { Knex } from 'knex';

import { RoleMetadata, Source } from '@janus-idp/backstage-plugin-rbac-common';

import { deepSortedEqual } from '../helper';

export const ROLE_METADATA_TABLE = 'role-metadata';

export interface RoleMetadataDao extends RoleMetadata {
  id?: number;
  roleEntityRef: string;
  source: Source;
}

export interface RoleMetadataStorage {
  findRoleMetadata(
    roleEntityRef: string,
    trx?: Knex.Transaction,
  ): Promise<RoleMetadataDao | undefined>;
  createRoleMetadata(
    roleMetadata: RoleMetadataDao,
    trx: Knex.Transaction,
  ): Promise<number>;
  updateRoleMetadata(
    roleMetadata: RoleMetadataDao,
    oldRoleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void>;
  removeRoleMetadata(
    roleEntityRef: string,
    source: Source,
    modifiedBy: string,
    trx: Knex.Transaction,
  ): Promise<void>;
}

export class DataBaseRoleMetadataStorage implements RoleMetadataStorage {
  constructor(private readonly knex: Knex<any, any[]>) {}

  async findRoleMetadata(
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
    metadata: RoleMetadataDao,
    trx: Knex.Transaction,
  ): Promise<number> {
    if (await this.findRoleMetadata(metadata.roleEntityRef, trx)) {
      const err = new ConflictError(
        `A metadata for role ${metadata.roleEntityRef} has already been stored`,
      );
      throw err;
    }

    const result = await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .insert(metadata)
      .returning<[{ id: number }]>('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    const err = new Error(
      `Failed to create the role metadata: '${JSON.stringify(metadata)}'.`,
    );
    throw err;
  }

  async updateRoleMetadata(
    newRoleMetadata: RoleMetadataDao,
    oldRoleEntityRef: string,
    trx: Knex.Transaction,
  ): Promise<void> {
    const currentMetadataDao = await this.findRoleMetadata(
      oldRoleEntityRef,
      trx,
    );

    if (!currentMetadataDao) {
      const err = new NotFoundError(
        `A metadata for role '${oldRoleEntityRef}' was not found`,
      );
      throw err;
    }

    if (
      currentMetadataDao.source !== 'legacy' &&
      currentMetadataDao.source !== newRoleMetadata.source
    ) {
      const err = new InputError(
        `The RoleMetadata.source field is 'read-only'.`,
      );
      throw err;
    }

    if (deepSortedEqual(currentMetadataDao, newRoleMetadata)) {
      return;
    }

    const result = await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .where('id', currentMetadataDao.id)
      .update(newRoleMetadata)
      .returning('id');

    if (!result || result.length === 0) {
      const err = new Error(
        `Failed to update the role metadata '${JSON.stringify(
          currentMetadataDao,
        )}' with new value: '${JSON.stringify(newRoleMetadata)}'.`,
      );
      throw err;
    }
  }

  async removeRoleMetadata(
    roleEntityRef: string,
    source: Source,
    modifiedBy: string,
    trx: Knex.Transaction,
  ): Promise<void> {
    const metadataDao = await this.findRoleMetadata(roleEntityRef, trx);
    if (!metadataDao) {
      const err = new NotFoundError(
        `A metadata for role '${roleEntityRef}' was not found`,
      );
      throw err;
    }

    await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .delete()
      .whereIn('id', [metadataDao.id!]);

    metadataDao.modifiedBy = modifiedBy;
    metadataDao.lastModified = new Date().toUTCString();
  }
}

export function daoToMetadata(dao: RoleMetadataDao): RoleMetadata {
  return {
    source: dao.source,
    description: dao.description,
    author: dao.author,
    modifiedBy: dao.modifiedBy,
    createdAt: dao.createdAt,
    lastModified: dao.lastModified,
  };
}

export function metadataToDao(
  roleMetadata: RoleMetadataDao,
  roleEntityRef: string,
): RoleMetadataDao {
  return {
    roleEntityRef,
    source: roleMetadata.source,
    description: roleMetadata.description,
  };
}

export function mergeMetadata(
  currentMetadata: RoleMetadataDao,
  newMetadata: RoleMetadataDao,
): RoleMetadataDao {
  const mergedMetaData: RoleMetadataDao = { ...currentMetadata };
  mergedMetaData.lastModified =
    newMetadata.lastModified ?? new Date().toUTCString();
  mergedMetaData.modifiedBy = newMetadata.modifiedBy;
  mergedMetaData.description =
    newMetadata.description ?? currentMetadata.description;
  mergedMetaData.roleEntityRef = newMetadata.roleEntityRef;
  mergedMetaData.source = newMetadata.source;
  return mergedMetaData;
}

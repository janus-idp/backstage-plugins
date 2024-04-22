import { ConflictError, InputError, NotFoundError } from '@backstage/errors';

import { Knex } from 'knex';

import { RoleMetadata, Source } from '@janus-idp/backstage-plugin-rbac-common';

import { AuditLogger } from '../audit-log/audit-logger';
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
    modifiedBy: string,
    trx: Knex.Transaction,
  ): Promise<void>;
}

export class DataBaseRoleMetadataStorage implements RoleMetadataStorage {
  constructor(
    private readonly knex: Knex<any, any[]>,
    private readonly aLog: AuditLogger,
  ) {}

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
      this.aLog.error(metadata.roleEntityRef, 'create', err);
      throw err;
    }

    const result = await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .insert(metadata)
      .returning<[{ id: number }]>('id');
    if (result && result?.length > 0) {
      this.aLog.info(metadata, 'Created');
      return result[0].id;
    }

    const err = new Error(
      `Failed to create the role metadata: '${JSON.stringify(metadata)}'.`,
    );
    this.aLog.error(metadata.roleEntityRef, 'create', err);
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
      this.aLog.error(oldRoleEntityRef, 'update', err);
      throw err;
    }

    if (
      currentMetadataDao.source !== 'legacy' &&
      currentMetadataDao.source !== newRoleMetadata.source
    ) {
      const err = new InputError(
        `The RoleMetadata.source field is 'read-only'.`,
      );
      this.aLog.error(oldRoleEntityRef, 'update', err);
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
      this.aLog.error(oldRoleEntityRef, 'update', err);
      throw err;
    }
    this.aLog.info(newRoleMetadata, 'Updated');
  }

  async removeRoleMetadata(
    roleEntityRef: string,
    modifiedBy: string,
    trx: Knex.Transaction,
  ): Promise<void> {
    const metadataDao = await this.findRoleMetadata(roleEntityRef, trx);
    if (!metadataDao) {
      const err = new NotFoundError(
        `A metadata for role '${roleEntityRef}' was not found`,
      );
      this.aLog.error(roleEntityRef, 'delete', err);
      throw err;
    }

    await trx<RoleMetadataDao>(ROLE_METADATA_TABLE)
      .delete()
      .whereIn('id', [metadataDao.id!]);
    metadataDao.modifiedBy = modifiedBy;
    this.aLog.info(metadataDao, 'Deleted');
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

import { ConflictError, NotFoundError } from '@backstage/errors';

import { Knex } from 'knex';

import {
  PermissionPolicyMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { policyToString } from '../helper';

const POLICY_METADATA_TABLE = 'policy-metadata';

export interface PermissionPolicyMetadataDao extends PermissionPolicyMetadata {
  id: number;
  policy: string;
}

export interface PolicyMetadataStorage {
  findPolicyMetadataBySource(
    source: string,
  ): Promise<PermissionPolicyMetadataDao[]>;
  findPolicyMetadata(
    policy: string[],
  ): Promise<PermissionPolicyMetadata | undefined>;
  createPolicyMetadata(
    source: Source,
    policy: string[],
    trx: Knex.Transaction,
  ): Promise<number>;
  removePolicyMetadata(policy: string[], trx: Knex.Transaction): Promise<void>;
}

export class DataBasePolicyMetadataStorage implements PolicyMetadataStorage {
  constructor(private readonly knex: Knex<any, any[]>) {}

  async findPolicyMetadataBySource(
    source: string,
  ): Promise<PermissionPolicyMetadataDao[]> {
    const metadataDao = await this.knex
      ?.table(POLICY_METADATA_TABLE)
      .where('source', source);

    return metadataDao;
  }

  async findPolicyMetadata(
    policy: string[],
  ): Promise<PermissionPolicyMetadata | undefined> {
    const policyMetadataDao = await this.findPolicyMetadataDao(policy);
    if (policyMetadataDao) {
      return this.daoToMetadata(policyMetadataDao);
    }
    return undefined;
  }

  private async findPolicyMetadataDao(
    policy: string[],
  ): Promise<PermissionPolicyMetadataDao | undefined> {
    const metadataDao = await this.knex
      ?.table(POLICY_METADATA_TABLE)
      .where('policy', policyToString(policy))
      // policy should be unique.
      .first();

    return metadataDao;
  }

  async createPolicyMetadata(
    source: Source,
    policy: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    const stringPolicy = policyToString(policy);
    if (await this.findPolicyMetadataDao(policy)) {
      throw new ConflictError(
        `A metadata for policy ${stringPolicy} has already been stored`,
      );
    }

    const metadataDao = { source, policy: stringPolicy };
    const result = await trx
      .table(POLICY_METADATA_TABLE)
      .insert<PermissionPolicyMetadataDao>(metadataDao)
      .returning('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(`Failed to create the policy metadata.`);
  }

  async removePolicyMetadata(
    policy: string[],
    trx: Knex.Transaction,
  ): Promise<void> {
    try {
      const metadataDao = await this.findPolicyMetadataDao(policy);
      if (!metadataDao) {
        throw new NotFoundError(
          `A metadata for policy ${policyToString(policy)} was not found`,
        );
      }

      await trx
        .table(POLICY_METADATA_TABLE)
        .delete()
        .whereIn('id', [metadataDao.id]);
    } catch (error) {
      throw error;
    }
  }

  private daoToMetadata(
    dao: PermissionPolicyMetadataDao,
  ): PermissionPolicyMetadata {
    return {
      source: dao.source,
    };
  }
}

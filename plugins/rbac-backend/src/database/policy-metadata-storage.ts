import { ConflictError, NotFoundError } from '@backstage/errors';

import { Knex } from 'knex';

import {
  PermissionPolicyMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { policyToString } from '../helper';

export const POLICY_METADATA_TABLE = 'policy-metadata';

export interface PermissionPolicyMetadataDao extends PermissionPolicyMetadata {
  id: number;
  policy: string;
}

export interface PolicyMetadataStorage {
  findPolicyMetadataBySource(
    source: string,
    trx?: Knex.Transaction,
  ): Promise<PermissionPolicyMetadataDao[]>;
  findPolicyMetadata(
    policy: string[],
    trx?: Knex.Transaction,
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
    trx: Knex.Transaction,
  ): Promise<PermissionPolicyMetadataDao[]> {
    const db = trx || this.knex;
    return await db?.table(POLICY_METADATA_TABLE).where('source', source);
  }

  async findPolicyMetadata(
    policy: string[],
    trx?: Knex.Transaction,
  ): Promise<PermissionPolicyMetadata | undefined> {
    const policyMetadataDao = await this.findPolicyMetadataDao(policy, trx);
    if (policyMetadataDao) {
      return this.daoToMetadata(policyMetadataDao);
    }
    return undefined;
  }

  private async findPolicyMetadataDao(
    policy: string[],
    trx?: Knex.Transaction,
  ): Promise<PermissionPolicyMetadataDao | undefined> {
    const db = trx || this.knex;
    return await db
      ?.table(POLICY_METADATA_TABLE)
      .where('policy', policyToString(policy))
      // policy should be unique.
      .first();
  }

  async createPolicyMetadata(
    source: Source,
    policy: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    const stringPolicy = policyToString(policy);
    if (await this.findPolicyMetadataDao(policy, trx)) {
      throw new ConflictError(
        `A metadata for policy '${stringPolicy}' has already been stored`,
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

    throw new Error(
      `Failed to create the policy metadata: '${JSON.stringify(metadataDao)}'.`,
    );
  }

  async removePolicyMetadata(
    policy: string[],
    trx: Knex.Transaction,
  ): Promise<void> {
    const metadataDao = await this.findPolicyMetadataDao(policy, trx);
    if (!metadataDao) {
      throw new NotFoundError(
        `A metadata for policy '${policyToString(policy)}' was not found`,
      );
    }

    await trx
      .table(POLICY_METADATA_TABLE)
      .delete()
      .whereIn('id', [metadataDao.id]);
  }

  private daoToMetadata(
    dao: PermissionPolicyMetadataDao,
  ): PermissionPolicyMetadata {
    return {
      source: dao.source,
    };
  }
}

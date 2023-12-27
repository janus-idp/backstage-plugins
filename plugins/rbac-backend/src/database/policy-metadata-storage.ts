import { ConflictError, NotFoundError } from '@backstage/errors';

import { Knex } from 'knex';

import {
  Location,
  PermissionPolicyMetadata,
} from '@janus-idp/backstage-plugin-rbac-common';

import { policyToString } from '../helper';

const POLICY_METADATA_TABLE = 'policy-metadata';

interface PermissionPolicyMetadataDao extends PermissionPolicyMetadata {
  id: number;
  policy: string;
}

export interface PolicyMetadataStorage {
  findPolicyMetadata(
    policy: string[],
  ): Promise<PermissionPolicyMetadata | undefined>;
  createPolicyMetadata(source: Location, policy: string[]): Promise<number>;
  updatePolicyMetadata(newPolicy: string[]): Promise<void>;
  removePolicyMetadata(policy: string[]): Promise<void>;
}

export class DataBasePolicyMetadataStorage implements PolicyMetadataStorage {
  constructor(private readonly knex: Knex<any, any[]>) {}

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
    location: Location,
    policy: string[],
  ): Promise<number> {
    const stringPolicy = policyToString(policy);
    if (await this.findPolicyMetadataDao(policy)) {
      throw new ConflictError(
        `A metadata for policy ${stringPolicy} has already been stored`,
      );
    }

    console.log(`=== Create policy metadata!!!!`);
    const metadataDao = { location, policy: stringPolicy };
    const result = await this.knex
      .table(POLICY_METADATA_TABLE)
      .insert<PermissionPolicyMetadataDao>(metadataDao)
      .returning('id');
    if (result && result?.length > 0) {
      return result[0].id;
    }

    throw new Error(`Failed to create the policy metadata.`);
  }

  async updatePolicyMetadata(policy: string[]): Promise<void> {
    const metadataDao = await this.findPolicyMetadataDao(policy);
    const policyStr = policyToString(policy);
    if (!metadataDao) {
      throw new NotFoundError(
        `A metadata for policy ${policyStr} was not found`,
      );
    }

    if (metadataDao.policy !== policyStr) {
      metadataDao.policy = policyStr;
      const result = await this.knex
        ?.table(POLICY_METADATA_TABLE)
        .where('id', metadataDao.id)
        .update<PermissionPolicyMetadataDao>(metadataDao)
        .returning('id');

      if (!result || result.length === 0) {
        throw new Error(
          `Failed to update the policy metadata with for policy: ${policyToString(
            policy,
          )}.`,
        );
      }
    }
  }

  async removePolicyMetadata(policy: string[]): Promise<void> {
    const metadataDao = await this.findPolicyMetadataDao(policy);
    if (!metadataDao) {
      throw new NotFoundError(
        `A metadata for policy ${policyToString(policy)} was not found`,
      );
    }

    await this.knex
      ?.table(POLICY_METADATA_TABLE)
      .delete()
      .whereIn('id', [metadataDao.id]);
  }

  private daoToMetadata(
    dao: PermissionPolicyMetadataDao,
  ): PermissionPolicyMetadata {
    return {
      location: dao.location,
    };
  }
}

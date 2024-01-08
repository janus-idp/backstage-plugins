import { NotAllowedError, NotFoundError } from '@backstage/errors';

import { Enforcer } from 'casbin';
import { Knex } from 'knex';

import {
  PermissionPolicyMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import {
  PermissionPolicyMetadataDao,
  PolicyMetadataStorage,
} from '../database/policy-metadata-storage';
import { policiesToString, policyToString } from '../helper';

export class EnforcerDelegate {
  constructor(
    private readonly enforcer: Enforcer,
    private readonly metadataStorage: PolicyMetadataStorage,
    private readonly knex: Knex,
  ) {}

  async hasPolicy(...policy: string[]): Promise<boolean> {
    return await this.enforcer.hasPolicy(...policy);
  }

  async hasGroupingPolicy(...policy: string[]): Promise<boolean> {
    return await this.enforcer.hasGroupingPolicy(...policy);
  }

  async getPolicy(): Promise<string[][]> {
    return await this.enforcer.getPolicy();
  }

  async getGroupingPolicy(): Promise<string[][]> {
    return await this.enforcer.getGroupingPolicy();
  }

  async getFilteredPolicy(
    fieldIndex: number,
    ...filter: string[]
  ): Promise<string[][]> {
    return await this.enforcer.getFilteredPolicy(fieldIndex, ...filter);
  }

  async getFilteredGroupingPolicy(
    fieldIndex: number,
    ...filter: string[]
  ): Promise<string[][]> {
    return await this.enforcer.getFilteredGroupingPolicy(fieldIndex, ...filter);
  }

  async addPolicy(policy: string[], source: Source): Promise<void> {
    const addMetadataTrx = await this.knex.transaction();

    try {
      await this.metadataStorage.createPolicyMetadata(
        source,
        policy,
        addMetadataTrx,
      );
      const ok = await this.enforcer.addPolicy(...policy);
      if (!ok) {
        throw new Error(`failed to create policy ${policyToString(policy)}`);
      }
      addMetadataTrx.commit();
    } catch (err) {
      addMetadataTrx.rollback();
      throw err;
    }
  }

  async addPolicies(policies: string[][], source: Source): Promise<void> {
    const addMetadataTrx = await this.knex.transaction();
    try {
      for (const policy of policies) {
        await this.metadataStorage.createPolicyMetadata(
          source,
          policy,
          addMetadataTrx,
        );
      }
      const ok = this.enforcer.addPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policies)}`,
        );
      }
      addMetadataTrx.commit();
    } catch (err) {
      addMetadataTrx.rollback();
      throw err;
    }
  }

  async addGroupingPolicy(policy: string[], source: Source): Promise<void> {
    const addMetadataTrx = await this.knex.transaction();

    try {
      await this.metadataStorage.createPolicyMetadata(
        source,
        policy,
        addMetadataTrx,
      );
      const ok = await this.enforcer.addGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`failed to create policy ${policyToString(policy)}`);
      }
      addMetadataTrx.commit();
    } catch (err) {
      addMetadataTrx.rollback();
      throw err;
    }
  }

  async addGroupingPolicies(
    policies: string[][],
    source: Source,
  ): Promise<void> {
    const addMetadataTrx = await this.knex.transaction();

    try {
      for (const policy of policies) {
        await this.metadataStorage.createPolicyMetadata(
          source,
          policy,
          addMetadataTrx,
        );
      }
      const ok = await this.enforcer.addGroupingPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policies)}`,
        );
      }
      addMetadataTrx.commit();
    } catch (err) {
      addMetadataTrx.rollback();
      throw err;
    }
  }

  async removePolicy(policy: string[], allowToDeleCSVFilePolicy?: boolean) {
    await this.checkIfPolicyModifiable(policy, allowToDeleCSVFilePolicy);

    const rmMetadataTrx = await this.knex.transaction();

    try {
      await this.metadataStorage.removePolicyMetadata(policy, rmMetadataTrx);
      const ok = await this.enforcer.removePolicy(...policy);
      if (!ok) {
        throw new Error(`fail to delete policy ${policy}`);
      }
      rmMetadataTrx.commit();
    } catch (err) {
      rmMetadataTrx.rollback(err);
      throw err;
    }
  }

  async removePolicies(
    policies: string[][],
    allowToDeleCSVFilePolicy?: boolean,
  ): Promise<void> {
    const rmMetadataTrx = await this.knex.transaction();

    try {
      for (const policy of policies) {
        await this.checkIfPolicyModifiable(policy, allowToDeleCSVFilePolicy);
        await this.metadataStorage.removePolicyMetadata(policy, rmMetadataTrx);
      }
      const ok = await this.enforcer.removePolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to delete policies ${policiesToString(policies)}`,
        );
      }
      rmMetadataTrx.commit();
    } catch (err) {
      rmMetadataTrx.rollback(err);
      throw err;
    }
  }

  async removeGroupingPolicy(
    policy: string[],
    allowToDeleCSVFilePolicy?: boolean,
  ) {
    const rmMetadataTrx = await this.knex.transaction();

    try {
      await this.checkIfPolicyModifiable(policy, allowToDeleCSVFilePolicy);
      await this.metadataStorage.removePolicyMetadata(policy, rmMetadataTrx);
      const ok = await this.enforcer.removeGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`Failed to delete policy ${policyToString(policy)}`);
      }
      rmMetadataTrx.commit();
    } catch (err) {
      rmMetadataTrx.rollback(err);
      throw err;
    }
  }

  async removeGroupingPolicies(
    policies: string[][],
    allowToDeleCSVFilePolicy?: boolean,
  ): Promise<void> {
    const rmMetadataTrx = await this.knex.transaction();
    try {
      for (const policy of policies) {
        await this.checkIfPolicyModifiable(policy, allowToDeleCSVFilePolicy);
        await this.metadataStorage.removePolicyMetadata(policy, rmMetadataTrx);
      }
      const ok = await this.enforcer.removeGroupingPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to delete grouping policies: ${policiesToString(policies)}`,
        );
      }
      rmMetadataTrx.commit();
    } catch (err) {
      rmMetadataTrx.rollback(err);
      throw err;
    }
  }

  async enforce(
    entityRef: string,
    resourceType: string,
    action: string,
  ): Promise<boolean> {
    return await this.enforcer.enforce(entityRef, resourceType, action);
  }

  // todo take a look, maybe we can make make it private ....
  async getMetadata(policy: string[]): Promise<PermissionPolicyMetadata> {
    const metadata = await this.metadataStorage.findPolicyMetadata(policy);
    if (!metadata) {
      throw new NotFoundError(`A metadata for policy ${policy} was not found`);
    }
    return metadata;
  }

  private async checkIfPolicyModifiable(
    policy: string[],
    allowToDeleCSVFilePolicy?: boolean,
  ) {
    const metadata = await this.metadataStorage.findPolicyMetadata(policy);
    if (!metadata) {
      throw new NotFoundError(
        `A metadata for policy ${policyToString(policy)} was not found`,
      );
    }
    if (metadata.source === 'csv-file' && !allowToDeleCSVFilePolicy) {
      throw new NotAllowedError(
        `policy ${policy} can be modified or deleted only with help of 'policies-csv-file'`,
      );
    }
  }

  async getFilteredPolicyMetadata(
    source: Source,
  ): Promise<PermissionPolicyMetadataDao[]> {
    return await this.metadataStorage.findPolicyMetadataBySource(source);
  }
}

import { NotAllowedError, NotFoundError } from '@backstage/errors';

import { Enforcer } from 'casbin';

import {
  PermissionPolicyMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { PolicyMetadataStorage } from '../database/policy-metadata-storage';
import { policiesToString, policyToString } from '../helper';

export class EnforcerDelegate {
  constructor(
    private readonly enforcer: Enforcer,
    private readonly metadataStorage: PolicyMetadataStorage,
  ) {}

  async hasPolicy(...policy: string[]): Promise<boolean> {
    return await this.enforcer.hasPolicy(...policy);
  }

  async hasGroupingPolicy(...policy: string[]): Promise<boolean> {
    return await this.enforcer.hasGroupingPolicy(...policy);
  }

  async addPolicy(policy: string[], source: Source): Promise<void> {
    // todo: use transaction here...
    // try {
    await this.metadataStorage.createPolicyMetadata(source, policy);
    const ok = await this.enforcer.addPolicy(...policy);
    if (!ok) {
      throw new Error(`failed to create policy ${policyToString(policy)}`);
    }
    // } catch(err) {
    // todo revert metadata transactions
    // } finally {
    // commit transaction
    // }
  }

  async addPolicies(policies: string[][], source: Source): Promise<void> {
    for (const policy of policies) {
      await this.metadataStorage.createPolicyMetadata(source, policy);
    }
    const ok = this.enforcer.addPolicies(policies);
    if (!ok) {
      // todo revert transaction.
      throw new Error(`Failed to store policies ${policiesToString(policies)}`);
    }
  }

  async addGroupingPolicy(policy: string[], source: Source): Promise<void> {
    await this.metadataStorage.createPolicyMetadata(source, policy);
    const ok = await this.enforcer.addGroupingPolicy(...policy);
    if (!ok) {
      // todo revert transactions
      throw new Error(`failed to create policy ${policyToString(policy)}`);
    }
  }

  async addGroupingPolicies(
    policies: string[][],
    source: Source,
  ): Promise<void> {
    for (const policy of policies) {
      await this.metadataStorage.createPolicyMetadata(source, policy);
    }
    const ok = await this.enforcer.addGroupingPolicies(policies);
    if (!ok) {
      // todo revert transaction.
      throw new Error(`Failed to store policies ${policiesToString(policies)}`);
    }
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

  async removePolicy(policy: string[], allowToDeleCSVFilePolicy?: boolean) {
    await this.checkIfPolicyModifiable(policy, allowToDeleCSVFilePolicy);

    await this.metadataStorage.removePolicyMetadata(policy);
    const ok = await this.enforcer.removePolicy(...policy);
    if (!ok) {
      // todo revert transaction
      throw new Error(`fail to delete policy ${policy}`);
    }
  }

  async removePolicies(
    policies: string[][],
    allowToDeleCSVFilePolicy?: boolean,
  ): Promise<void> {
    for (const policy of policies) {
      await this.checkIfPolicyModifiable(policy, allowToDeleCSVFilePolicy);
      await this.metadataStorage.removePolicyMetadata(policy);
    }
    const ok = await this.enforcer.removePolicies(policies);
    if (!ok) {
      // revert transactions
      throw new Error(
        `Failed to delete policies ${policiesToString(policies)}`,
      );
    }
  }

  async removeGroupingPolicy(
    policy: string[],
    allowToDeleCSVFilePolicy?: boolean,
  ) {
    await this.checkIfPolicyModifiable(policy, allowToDeleCSVFilePolicy);
    await this.metadataStorage.removePolicyMetadata(policy);
    const ok = await this.enforcer.removeGroupingPolicy(...policy);
    if (!ok) {
      // todo revert transaction
      throw new Error(`Failed to delete policy ${policyToString(policy)}`);
    }
  }

  async removeGroupingPolicies(
    policies: string[][],
    allowToDeleCSVFilePolicy?: boolean,
  ): Promise<void> {
    for (const policy of policies) {
      await this.checkIfPolicyModifiable(policy, allowToDeleCSVFilePolicy);
      await this.metadataStorage.removePolicyMetadata(policy);
    }
    const ok = await this.enforcer.removeGroupingPolicies(policies);
    if (!ok) {
      // revert transactions
      throw new Error(
        `Failed to delete grouping policies: ${policiesToString(policies)}`,
      );
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
}

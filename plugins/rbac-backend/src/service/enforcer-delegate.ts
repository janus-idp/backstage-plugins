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
    private readonly policyMetadataStorage: PolicyMetadataStorage,
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
      await this.policyMetadataStorage.createPolicyMetadata(
        source,
        policy,
        addMetadataTrx,
      );
      const ok = await this.enforcer.addPolicy(...policy);
      if (!ok) {
        throw new Error(`failed to create policy ${policyToString(policy)}`);
      }
      await addMetadataTrx.commit();
    } catch (err) {
      await addMetadataTrx.rollback(err);
      throw err;
    }
  }

  async addPolicies(policies: string[][], source: Source): Promise<void> {
    const addMetadataTrx = await this.knex.transaction();
    try {
      for (const policy of policies) {
        await this.policyMetadataStorage.createPolicyMetadata(
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
      await addMetadataTrx.commit();
    } catch (err) {
      await addMetadataTrx.rollback(err);
      throw err;
    }
  }

  async addGroupingPolicy(
    policy: string[],
    source: Source,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx || (await this.knex.transaction());

    try {
      await this.policyMetadataStorage.createPolicyMetadata(
        source,
        policy,
        trx,
      );
      const ok = await this.enforcer.addGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`failed to create policy ${policyToString(policy)}`);
      }
      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async addGroupingPolicies(
    policies: string[][],
    source: Source,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx || (await this.knex.transaction());

    try {
      for (const policy of policies) {
        await this.policyMetadataStorage.createPolicyMetadata(
          source,
          policy,
          trx,
        );
      }

      const ok = await this.enforcer.addGroupingPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policies)}`,
        );
      }

      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async removePolicy(policy: string[], allowToDeleteCSVFilePolicy?: boolean) {
    const rmMetadataTrx = await this.knex.transaction();

    try {
      await this.checkIfPolicyModifiable(
        policy,
        rmMetadataTrx,
        allowToDeleteCSVFilePolicy,
      );
      await this.policyMetadataStorage.removePolicyMetadata(
        policy,
        rmMetadataTrx,
      );
      const ok = await this.enforcer.removePolicy(...policy);
      if (!ok) {
        throw new Error(`fail to delete policy ${policy}`);
      }
      await rmMetadataTrx.commit();
    } catch (err) {
      await rmMetadataTrx.rollback(err);
      throw err;
    }
  }

  async removePolicies(
    policies: string[][],
    allowToDeleCSVFilePolicy?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx || (await this.knex.transaction());

    try {
      for (const policy of policies) {
        await this.checkIfPolicyModifiable(
          policy,
          trx,
          allowToDeleCSVFilePolicy,
        );
        await this.policyMetadataStorage.removePolicyMetadata(policy, trx);
      }
      const ok = await this.enforcer.removePolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to delete policies ${policiesToString(policies)}`,
        );
      }

      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      throw err;
    }
  }

  async removeGroupingPolicy(
    policy: string[],
    allowToDeleCSVFilePolicy?: boolean,
  ) {
    const rmMetadataTrx = await this.knex.transaction();

    try {
      await this.checkIfPolicyModifiable(
        policy,
        rmMetadataTrx,
        allowToDeleCSVFilePolicy,
      );
      await this.policyMetadataStorage.removePolicyMetadata(
        policy,
        rmMetadataTrx,
      );
      const ok = await this.enforcer.removeGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`Failed to delete policy ${policyToString(policy)}`);
      }
      await rmMetadataTrx.commit();
    } catch (err) {
      await rmMetadataTrx.rollback(err);
      throw err;
    }
  }

  async removeGroupingPolicies(
    policies: string[][],
    allowToDeleteCSVFilePolicy?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx || (await this.knex.transaction());
    try {
      for (const policy of policies) {
        await this.checkIfPolicyModifiable(
          policy,
          trx,
          allowToDeleteCSVFilePolicy,
        );
        await this.policyMetadataStorage.removePolicyMetadata(policy, trx);
      }

      const ok = await this.enforcer.removeGroupingPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to delete grouping policies: ${policiesToString(policies)}`,
        );
      }

      if (!externalTrx) {
        await trx.commit();
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
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
    const metadata =
      await this.policyMetadataStorage.findPolicyMetadata(policy);
    if (!metadata) {
      throw new NotFoundError(`A metadata for policy ${policy} was not found`);
    }
    return metadata;
  }

  private async checkIfPolicyModifiable(
    policy: string[],
    trx: Knex.Transaction,
    allowToModifyCSVFilePolicy?: boolean,
  ) {
    const metadata = await this.policyMetadataStorage.findPolicyMetadata(
      policy,
      trx,
    );
    if (!metadata) {
      throw new NotFoundError(
        `A metadata for policy '${policyToString(policy)}' was not found`,
      );
    }
    if (metadata.source === 'csv-file' && !allowToModifyCSVFilePolicy) {
      throw new NotAllowedError(
        `policy '${policyToString(
          policy,
        )}' can be modified or deleted only with help of 'policies-csv-file'`,
      );
    }
    if (metadata?.source === 'configuration') {
      throw new Error(
        `Error: Attempted to modify an immutable pre-defined policy '${policyToString(
          policy,
        )}'.
        This policy cannot be altered directly. If you need to make changes, consider removing the associated RBAC admin '${
          policy[0]
        }' using the application configuration.`,
      );
    }
  }

  async getFilteredPolicyMetadata(
    source: Source,
  ): Promise<PermissionPolicyMetadataDao[]> {
    return await this.policyMetadataStorage.findPolicyMetadataBySource(source);
  }
}

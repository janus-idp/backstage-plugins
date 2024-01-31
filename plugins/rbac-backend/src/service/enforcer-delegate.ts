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
import { RoleMetadataStorage } from '../database/role-metadata';
import { policiesToString, policyToString } from '../helper';

export class EnforcerDelegate {
  constructor(
    private readonly enforcer: Enforcer,
    private readonly policyMetadataStorage: PolicyMetadataStorage,
    private readonly roleMetadataStorage: RoleMetadataStorage,
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

  async addPolicy(
    policy: string[],
    source: Source,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      await this.policyMetadataStorage.createPolicyMetadata(
        source,
        policy,
        trx,
      );
      const ok = await this.enforcer.addPolicy(...policy);
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

  async addPolicies(
    policies: string[][],
    source: Source,
    externalTrx: Knex.Transaction,
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
      const ok = await this.enforcer.addPolicies(policies);
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

  async addGroupingPolicy(
    policy: string[],
    source: Source,
    externalTrx?: Knex.Transaction,
    isUpdate?: boolean,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const entityRef = policy[1];
    let metadata;

    if (entityRef.startsWith(`role:`)) {
      metadata = await this.roleMetadataStorage.findRoleMetadata(
        entityRef,
        trx,
      );
    }

    try {
      await this.policyMetadataStorage.createPolicyMetadata(
        source,
        policy,
        trx,
      );

      if (!metadata && !isUpdate) {
        await this.roleMetadataStorage.createRoleMetadata(
          { source },
          entityRef,
          trx,
        );
      }

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
    isUpdate?: boolean,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      for (const policy of policies) {
        const entityRef = policy[1];
        let metadata;

        if (entityRef.startsWith(`role:`)) {
          metadata = await this.roleMetadataStorage.findRoleMetadata(
            entityRef,
            trx,
          );
        }

        await this.policyMetadataStorage.createPolicyMetadata(
          source,
          policy,
          trx,
        );

        if (!metadata && !isUpdate) {
          await this.roleMetadataStorage.createRoleMetadata(
            { source },
            entityRef,
            trx,
          );
        }
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

  async updateGroupingPolicies(
    oldRole: string[][],
    newRole: string[][],
    source: Source,
    allowToDeleteCSVFilePolicy?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const newRoleName = newRole.at(0)?.at(1)!;
    const oldRoleName = oldRole.at(0)?.at(1)!;
    try {
      await this.roleMetadataStorage.updateRoleMetadata(
        { source: source, roleEntityRef: newRoleName },
        oldRoleName,
        trx,
      );
      await this.removeGroupingPolicies(
        oldRole,
        source,
        allowToDeleteCSVFilePolicy,
        true,
        trx,
      );
      await this.addGroupingPolicies(newRole, source, trx, true);
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

  async updatePolicies(
    oldPolicies: string[][],
    newPolicies: string[][],
    source: Source,
    allowToDeleteCSVFilePolicy?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      await this.removePolicies(
        oldPolicies,
        source,
        allowToDeleteCSVFilePolicy,
        trx,
      );
      await this.addPolicies(newPolicies, source, trx);
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

  async removePolicy(
    policy: string[],
    source: Source,
    allowToDeleteCSVFilePolicy?: boolean,
    externalTrx?: Knex.Transaction,
  ) {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      await this.checkIfPolicyModifiable(
        policy,
        source,
        trx,
        allowToDeleteCSVFilePolicy,
      );
      await this.policyMetadataStorage.removePolicyMetadata(policy, trx);
      const ok = await this.enforcer.removePolicy(...policy);
      if (!ok) {
        throw new Error(`fail to delete policy ${policy}`);
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

  async removePolicies(
    policies: string[][],
    source: Source,
    allowToDeleCSVFilePolicy?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      for (const policy of policies) {
        await this.checkIfPolicyModifiable(
          policy,
          source,
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
    source: Source,
    isUpdate?: boolean,
    allowToDeleCSVFilePolicy?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const roleEntity = policy[1];

    try {
      await this.checkIfPolicyModifiable(
        policy,
        source,
        trx,
        allowToDeleCSVFilePolicy,
      );
      await this.policyMetadataStorage.removePolicyMetadata(policy, trx);
      if (!isUpdate) {
        await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
      }
      const ok = await this.enforcer.removeGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`Failed to delete policy ${policyToString(policy)}`);
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

  async removeGroupingPolicies(
    policies: string[][],
    source: Source,
    allowToDeleteCSVFilePolicy?: boolean,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    try {
      for (const policy of policies) {
        const roleEntity = policy[1];
        await this.checkIfPolicyModifiable(
          policy,
          source,
          trx,
          allowToDeleteCSVFilePolicy,
        );
        if (!isUpdate) {
          await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
        }
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

  async addOrUpdatePolicy(
    policy: string[],
    source: Source,
    isCSV: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    try {
      if (!(await this.enforcer.hasPolicy(...policy))) {
        await this.addPolicy(policy, source, trx);
      } else if (await this.hasFilteredPolicyMetadata(policy, 'legacy', trx)) {
        await this.removePolicy(policy, source, isCSV, trx);
        await this.addPolicy(policy, source, trx);
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

  async addOrUpdateGroupingPolicy(
    groupPolicy: string[],
    source: Source,
    isCSV?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    try {
      if (!(await this.hasGroupingPolicy(...groupPolicy))) {
        await this.addGroupingPolicy(groupPolicy, source, trx);
      } else if (
        await this.hasFilteredPolicyMetadata(groupPolicy, 'legacy', trx)
      ) {
        await this.roleMetadataStorage.updateRoleMetadata(
          { source: source, roleEntityRef: groupPolicy.at(1)! },
          groupPolicy.at(1)!,
          trx,
        );
        await this.removeGroupingPolicy(groupPolicy, source, true, isCSV, trx);
        await this.addGroupingPolicy(groupPolicy, source, trx, true);
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

  async addOrUpdateGroupingPolicies(
    groupPolicies: string[][],
    source: Source,
    isCSV?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    try {
      for (const groupPolicy of groupPolicies) {
        if (!(await this.hasGroupingPolicy(...groupPolicy))) {
          await this.addGroupingPolicy(groupPolicy, source, trx);
        } else if (
          await this.hasFilteredPolicyMetadata(groupPolicy, 'legacy', trx)
        ) {
          await this.roleMetadataStorage.updateRoleMetadata(
            { source: source, roleEntityRef: groupPolicy.at(1)! },
            groupPolicy.at(1)!,
            trx,
          );
          await this.removeGroupingPolicy(
            groupPolicy,
            source,
            true,
            isCSV,
            trx,
          );
          await this.addGroupingPolicy(groupPolicy, source, trx, true);
        }
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
    policySource: Source,
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
    if (
      metadata?.source === 'configuration' &&
      policySource !== 'configuration'
    ) {
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

  async hasFilteredPolicyMetadata(
    policy: string[],
    source: Source,
    externalTrx?: Knex.Transaction,
  ): Promise<boolean> {
    const metadata = await this.policyMetadataStorage.findPolicyMetadata(
      policy,
      externalTrx,
    );

    if (metadata?.source === source) {
      return true;
    }

    return false;
  }

  async getImplicitPermissionsForUser(user: string): Promise<string[][]> {
    return this.enforcer.getImplicitPermissionsForUser(user);
  }
}

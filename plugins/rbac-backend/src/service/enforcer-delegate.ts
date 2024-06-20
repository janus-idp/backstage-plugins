import { Enforcer, newModelFromString } from 'casbin';
import { Knex } from 'knex';

import { Source } from '@janus-idp/backstage-plugin-rbac-common';

import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { policiesToString, policyToString } from '../helper';
import { MODEL } from './permission-model';
import { ADMIN_ROLE_NAME } from './permission-policy';

export class EnforcerDelegate {
  constructor(
    private readonly enforcer: Enforcer,
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

  async getRolesForUser(userEntityRef: string): Promise<string[]> {
    return await this.enforcer.getRolesForUser(userEntityRef);
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
      const ok = await this.enforcer.addPolicy(...policy, source);
      if (!ok) {
        throw new Error(
          `failed to create policy ${policyToString([...policy, source])}`,
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

  async addPolicies(
    policies: string[][],
    source: Source,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx || (await this.knex.transaction());
    try {
      const policiesWithSource = policies.map(policy => [...policy, source]);
      const ok = await this.enforcer.addPolicies(policiesWithSource);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policiesWithSource)}`,
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
    roleMetadata: RoleMetadataDao,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const entityRef = roleMetadata.roleEntityRef;

    try {
      let currentMetadata;
      if (entityRef.startsWith(`role:`)) {
        currentMetadata = await this.roleMetadataStorage.findRoleMetadata(
          entityRef,
          trx,
        );
      }

      if (currentMetadata) {
        await this.roleMetadataStorage.updateRoleMetadata(
          this.mergeMetadata(currentMetadata, roleMetadata),
          entityRef,
          trx,
        );
      } else {
        const currentDate: Date = new Date();
        roleMetadata.createdAt = currentDate.toUTCString();
        roleMetadata.lastModified = currentDate.toUTCString();
        await this.roleMetadataStorage.createRoleMetadata(roleMetadata, trx);
      }

      const ok = await this.enforcer.addGroupingPolicy(
        ...policy,
        roleMetadata.source,
      );
      if (!ok) {
        throw new Error(
          `failed to create policy ${policyToString([...policy, roleMetadata.source])}`,
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

  async addGroupingPolicies(
    policies: string[][],
    roleMetadata: RoleMetadataDao,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      const currentRoleMetadata =
        await this.roleMetadataStorage.findRoleMetadata(
          roleMetadata.roleEntityRef,
          trx,
        );
      if (currentRoleMetadata) {
        await this.roleMetadataStorage.updateRoleMetadata(
          this.mergeMetadata(currentRoleMetadata, roleMetadata),
          roleMetadata.roleEntityRef,
          trx,
        );
      } else {
        const currentDate: Date = new Date();
        roleMetadata.createdAt = currentDate.toUTCString();
        roleMetadata.lastModified = currentDate.toUTCString();
        await this.roleMetadataStorage.createRoleMetadata(roleMetadata, trx);
      }

      const policiesWithSource = policies.map(policy => [
        ...policy,
        roleMetadata.source,
      ]);
      const ok = await this.enforcer.addGroupingPolicies(policiesWithSource);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policiesWithSource)}`,
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
    newRoleMetadata: RoleMetadataDao,
  ): Promise<void> {
    const oldRoleName = oldRole.at(0)?.at(1)!;

    const trx = await this.knex.transaction();
    try {
      const currentMetadata = await this.roleMetadataStorage.findRoleMetadata(
        oldRoleName,
        trx,
      );
      if (!currentMetadata) {
        throw new Error(`Role metadata ${oldRoleName} was not found`);
      }

      await this.removeGroupingPolicies(oldRole, currentMetadata, true, trx);
      await this.addGroupingPolicies(newRole, newRoleMetadata, trx);
      await trx.commit();
    } catch (err) {
      await trx.rollback(err);
      throw err;
    }
  }

  async updatePolicies(
    oldPolicies: string[][],
    newPolicies: string[][],
    source: Source,
  ): Promise<void> {
    const trx = await this.knex.transaction();

    try {
      await this.removePolicies(oldPolicies, source, trx);
      await this.addPolicies(newPolicies, source, trx);
      await trx.commit();
    } catch (err) {
      await trx.rollback(err);
      throw err;
    }
  }

  async removePolicy(
    policy: string[],
    source: Source,
    externalTrx?: Knex.Transaction,
  ) {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      const ok = await this.enforcer.removePolicy(...policy, source);
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
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    try {
      const policiesWithSource = policies.map(policy => [...policy, source]);
      const ok = await this.enforcer.removePolicies(policiesWithSource);
      if (!ok) {
        throw new Error(
          `Failed to delete policies ${policiesToString(policiesWithSource)}`,
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
    roleMetadata: RoleMetadataDao,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const roleEntity = policy[1];

    try {
      const ok = await this.enforcer.removeGroupingPolicy(
        policy[0],
        policy[1],
        roleMetadata.source,
      );
      if (!ok) {
        throw new Error(`Failed to delete policy ${policyToString(policy)}`);
      }

      if (!isUpdate) {
        const currentRoleMetadata =
          await this.roleMetadataStorage.findRoleMetadata(roleEntity, trx);
        const remainingGroupPolicies =
          await this.enforcer.getFilteredGroupingPolicy(1, roleEntity);
        if (
          currentRoleMetadata &&
          remainingGroupPolicies.length === 0 &&
          roleEntity !== ADMIN_ROLE_NAME
        ) {
          await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
        } else if (currentRoleMetadata) {
          await this.roleMetadataStorage.updateRoleMetadata(
            this.mergeMetadata(currentRoleMetadata, roleMetadata),
            roleEntity,
            trx,
          );
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

  async removeGroupingPolicies(
    policies: string[][],
    roleMetadata: RoleMetadataDao,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    const roleEntity = roleMetadata.roleEntityRef;
    try {
      const policiesWithSource = policies.map(policy => [
        policy[0],
        policy[1],
        roleMetadata.source,
      ]);
      const ok = await this.enforcer.removeGroupingPolicies(policiesWithSource);
      if (!ok) {
        throw new Error(
          `Failed to delete grouping policies: ${policiesToString(policiesWithSource)}`,
        );
      }

      if (!isUpdate) {
        const currentRoleMetadata =
          await this.roleMetadataStorage.findRoleMetadata(roleEntity, trx);
        const remainingGroupPolicies =
          await this.enforcer.getFilteredGroupingPolicy(1, roleEntity);
        if (
          currentRoleMetadata &&
          remainingGroupPolicies.length === 0 &&
          roleEntity !== ADMIN_ROLE_NAME
        ) {
          await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
        } else if (currentRoleMetadata) {
          await this.roleMetadataStorage.updateRoleMetadata(
            this.mergeMetadata(currentRoleMetadata, roleMetadata),
            roleEntity,
            trx,
          );
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

  async addOrUpdatePolicy(policy: string[], source: Source): Promise<void> {
    const trx = await this.knex.transaction();
    try {
      if (await this.hasPolicy(...policy, 'legacy')) {
        await this.removePolicy(policy, 'legacy', trx);
        await this.addPolicy(policy, source, trx);
      } else if (!(await this.hasPolicy(...policy, source))) {
        await this.addPolicy(policy, source, trx);
      }

      await trx.commit();
    } catch (err) {
      await trx.rollback(err);
      throw err;
    }
  }

  async addOrUpdateGroupingPolicy(
    groupPolicy: string[],
    roleMetadata: RoleMetadataDao,
  ): Promise<void> {
    const trx = await this.knex.transaction();
    try {
      if (await this.hasGroupingPolicy(...groupPolicy, 'legacy')) {
        await this.removeGroupingPolicy(
          groupPolicy,
          { ...roleMetadata, source: 'legacy' },
          true,
          trx,
        );
        await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
      } else if (
        !(await this.hasGroupingPolicy(...groupPolicy, roleMetadata.source))
      ) {
        await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
      }

      await trx.commit();
    } catch (err) {
      await trx.rollback(err);
      throw err;
    }
  }

  async addOrUpdateGroupingPolicies(
    groupPolicies: string[][],
    roleMetadata: RoleMetadataDao,
  ): Promise<void> {
    const trx = await this.knex.transaction();
    try {
      for (const groupPolicy of groupPolicies) {
        if (await this.hasGroupingPolicy(...groupPolicy, 'legacy')) {
          await this.removeGroupingPolicy(groupPolicy, roleMetadata, true, trx);
          await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
        } else if (
          !(await this.hasGroupingPolicy(...groupPolicy, roleMetadata.source))
        ) {
          await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
        }
      }
      await trx.commit();
    } catch (err) {
      await trx.rollback(err);
      throw err;
    }
  }

  /**
   * enforce aims to enforce a particular permission policy based on the user that it receives.
   * Under the hood, enforce uses the `enforce` method from the enforcer`.
   *
   * Before enforcement, a filter is set up to reduce the number of permission policies that will
   * be loaded in.
   * This will reduce the amount of checks that need to be made to determine if a user is authorize
   * to perform an action
   *
   * A temporary enforcer will also be used while enforcing.
   * This is to ensure that the filter does not interact with the base enforcer.
   * The temporary enforcer has lazy loading of the permission policies enabled to reduce the amount
   * of time it takes to initialize the temporary enforcer.
   * The justification for lazy loading is because permission policies are already present in the
   * role manager / database and it will be filtered and loaded whenever `loadFilteredPolicy` is called.
   * @param entityRef The user to enforce
   * @param resourceType The resource type / name of the permission policy
   * @param action The action of the permission policy
   * @param roles Any roles that the user is directly or indirectly attached to.
   * Used for filtering permission policies.
   * @returns True if the user is allowed based on the particular permission
   */
  async enforce(
    entityRef: string,
    resourceType: string,
    action: string,
    roles: string[],
  ): Promise<boolean> {
    const filter = [];
    if (roles.length > 0) {
      roles.forEach(role => {
        filter.push({ ptype: 'p', v0: role, v1: resourceType, v2: action });
      });
    } else {
      filter.push({ ptype: 'p', v1: resourceType, v2: action });
    }

    const adapt = this.enforcer.getAdapter();
    const roleManager = this.enforcer.getRoleManager();
    const tempEnforcer = new Enforcer();
    await tempEnforcer.initWithModelAndAdapter(
      newModelFromString(MODEL),
      adapt,
      true,
    );
    tempEnforcer.setRoleManager(roleManager);

    await tempEnforcer.loadFilteredPolicy(filter);

    return await tempEnforcer.enforce(entityRef, resourceType, action);
  }

  async getFilteredPoliciesBySource(
    source: Source,
    isCutSource?: boolean,
  ): Promise<string[][]> {
    return (await this.enforcer.getFilteredPolicy(4, source)).map(policy =>
      isCutSource ? policy.slice(0, -1) : policy,
    );
  }

  async getFilteredGroupingPoliciesBySource(
    source: Source,
    isCutSource?: boolean,
  ): Promise<string[][]> {
    return (await this.enforcer.getFilteredGroupingPolicy(2, source)).map(
      gPolicy => (isCutSource ? gPolicy.slice(0, -1) : gPolicy),
    );
  }

  async getImplicitPermissionsForUser(user: string): Promise<string[][]> {
    return this.enforcer.getImplicitPermissionsForUser(user);
  }

  async getAllRoles(): Promise<string[]> {
    return this.enforcer.getAllRoles();
  }

  private mergeMetadata(
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
}

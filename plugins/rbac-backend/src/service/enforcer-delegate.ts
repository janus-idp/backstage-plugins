import { NotAllowedError, NotFoundError } from '@backstage/errors';

import { Enforcer, newModelFromString } from 'casbin';
import { Knex } from 'knex';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionPolicyMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import {
  createAuditPermissionOptions,
  createAuditRoleOptions,
  getMembersDiff,
  getPoliciesDiff,
  Operation,
  PermissionDiff,
  PermissionEvents,
  RoleEvents,
} from '../audit-log/audit-logger';
import {
  PermissionPolicyMetadataDao,
  PolicyMetadataStorage,
} from '../database/policy-metadata-storage';
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
    private readonly policyMetadataStorage: PolicyMetadataStorage,
    private readonly roleMetadataStorage: RoleMetadataStorage,
    private readonly knex: Knex,
    private readonly aLog: AuditLogger,
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
    modifiedBy: string,
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

        const auditOptions = createAuditPermissionOptions(
          [policy],
          'CREATE',
          source,
          modifiedBy,
          { added: [policy] },
        );
        await this.aLog.auditLog(auditOptions);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);

        await this.aLog.auditErrorLog({
          eventName: PermissionEvents.CREATE_POLICY_ERROR,
          message: 'Error creating policy',
          stage: 'rollback',
          actorId: modifiedBy,
          errors: [err],
          metadata: { policy, source },
        });
      }

      throw err;
    }
  }

  async addPolicies(
    policies: string[][],
    source: Source,
    modifiedBy: string,
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
      const ok = await this.enforcer.addPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policies)}`,
        );
      }
      if (!externalTrx) {
        await trx.commit();

        const auditOptions = createAuditPermissionOptions(
          policies,
          'CREATE',
          source,
          modifiedBy,
          { added: policies },
        );
        await this.aLog.auditLog(auditOptions);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);

        await this.aLog.auditErrorLog({
          eventName: PermissionEvents.CREATE_POLICY,
          message: 'Error creation policies',
          stage: 'rollback',
          actorId: modifiedBy,
          errors: [err],
          metadata: { policies, source },
        });
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
      await this.policyMetadataStorage.createPolicyMetadata(
        roleMetadata.source,
        policy,
        trx,
      );

      let currentRoleMetadata;
      if (entityRef.startsWith(`role:`)) {
        currentRoleMetadata = await this.roleMetadataStorage.findRoleMetadata(
          entityRef,
          trx,
        );
      }

      if (currentRoleMetadata) {
        const actualRoleMetadata = this.mergeMetadata(
          currentRoleMetadata,
          roleMetadata,
        );
        await this.roleMetadataStorage.updateRoleMetadata(
          actualRoleMetadata,
          entityRef,
          trx,
        );
      } else {
        const currentDate: Date = new Date();
        roleMetadata.createdAt = currentDate.toUTCString();
        roleMetadata.lastModified = currentDate.toUTCString();
        await this.roleMetadataStorage.createRoleMetadata(roleMetadata, trx);
      }

      const ok = await this.enforcer.addGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`failed to create policy ${policyToString(policy)}`);
      }
      if (!externalTrx) {
        await trx.commit();
      }

      if (!externalTrx) {
        const auditOptions = createAuditRoleOptions(
          currentRoleMetadata ? 'UPDATE' : 'CREATE',
          roleMetadata,
          { added: [policy[0]] },
          currentRoleMetadata,
        );
        await this.aLog.auditLog(auditOptions);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);

        await this.aLog.auditErrorLog({
          eventName: RoleEvents.CREATE_OR_UPDATE_ROLE_ERROR,
          message: `Error adding grouping policy for role: ${roleMetadata.roleEntityRef}`,
          stage: 'rollback',
          actorId: roleMetadata.modifiedBy,
          errors: [err],
          metadata: {
            policy,
            roleEntity: roleMetadata.roleEntityRef,
            source: roleMetadata.source,
          },
        });
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
      for (const policy of policies) {
        await this.policyMetadataStorage.createPolicyMetadata(
          roleMetadata.source,
          policy,
          trx,
        );
      }

      const currentRoleMetadata =
        await this.roleMetadataStorage.findRoleMetadata(
          roleMetadata.roleEntityRef,
          trx,
        );
      let updatedRoleMetadata;
      if (currentRoleMetadata) {
        updatedRoleMetadata = this.mergeMetadata(
          currentRoleMetadata,
          roleMetadata,
        );
        await this.roleMetadataStorage.updateRoleMetadata(
          updatedRoleMetadata,
          roleMetadata.roleEntityRef,
          trx,
        );
      } else {
        const currentDate: Date = new Date();
        roleMetadata.createdAt = currentDate.toUTCString();
        roleMetadata.lastModified = currentDate.toUTCString();
        await this.roleMetadataStorage.createRoleMetadata(roleMetadata, trx);
      }

      const ok = await this.enforcer.addGroupingPolicies(policies);
      if (!ok) {
        throw new Error(
          `Failed to store policies ${policiesToString(policies)}`,
        );
      }

      if (!externalTrx) {
        await trx.commit();

        const operation = currentRoleMetadata ? 'UPDATE' : 'CREATE';
        const auditOption = createAuditRoleOptions(
          operation,
          roleMetadata,
          { added: policies.map(p => p[0]) },
          currentRoleMetadata,
        );
        await this.aLog.auditLog(auditOption);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);

        await this.aLog.auditErrorLog({
          eventName: RoleEvents.CREATE_OR_UPDATE_ROLE_ERROR,
          message: `Error adding grouping policies for role ${roleMetadata.roleEntityRef}`,
          stage: 'rollback',
          actorId: roleMetadata.modifiedBy,
          errors: [err],
          metadata: {
            policies,
            roleEntity: roleMetadata.roleEntityRef,
            source: roleMetadata.source,
          },
        });
      }

      throw err;
    }
  }

  async updateGroupingPolicies(
    oldRole: string[][],
    newRole: string[][],
    newRoleMetadata: RoleMetadataDao,
    allowToDeleteCSVFilePolicy?: boolean,
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

      await this.removeGroupingPolicies(
        oldRole,
        currentMetadata,
        allowToDeleteCSVFilePolicy,
        true,
        trx,
      );
      await this.addGroupingPolicies(newRole, newRoleMetadata, trx);

      await trx.commit();

      const memberDiff = getMembersDiff(
        oldRole,
        newRole,
        currentMetadata.source,
        newRoleMetadata.source,
      );
      const auditOptions = createAuditRoleOptions(
        'UPDATE',
        newRoleMetadata,
        memberDiff,
        currentMetadata,
      );
      await this.aLog.auditLog(auditOptions);
    } catch (err) {
      await trx.rollback(err);

      await this.aLog.auditErrorLog({
        eventName: RoleEvents.UPDATE_ROLE_ERROR,
        message: `Error updating grouping policies for role: ${oldRoleName}`,
        stage: 'rollback',
        actorId: newRoleMetadata.modifiedBy,
        errors: [err],
        metadata: {
          oldGroupPolicies: oldRole,
          newGroupPolicies: newRole,
          roleEntity: newRoleMetadata.roleEntityRef,
          source: newRoleMetadata.source,
        },
      });

      throw err;
    }
  }

  async updatePolicies(
    oldPolicies: string[][],
    newPolicies: string[][],
    source: Source,
    modifiedBy: string,
    allowToDeleteCSVFilePolicy?: boolean,
  ): Promise<void> {
    const trx = await this.knex.transaction();

    try {
      await this.removePolicies(
        oldPolicies,
        source,
        modifiedBy,
        true,
        allowToDeleteCSVFilePolicy,
        trx,
      );
      await this.addPolicies(newPolicies, source, modifiedBy, trx);
      await trx.commit();

      const diff = getPoliciesDiff(oldPolicies, newPolicies);
      const auditOptions = createAuditPermissionOptions(
        newPolicies,
        'UPDATE',
        source,
        modifiedBy,
        diff,
      );
      await this.aLog.auditLog(auditOptions);
    } catch (err) {
      await trx.rollback(err);

      await this.aLog.auditErrorLog({
        eventName: PermissionEvents.UPDATE_POLICY_ERROR,
        message: 'Error updating policy',
        stage: 'rollback',
        actorId: modifiedBy,
        errors: [err],
        metadata: { oldPolicies, newPolicies, source },
      });
      throw err;
    }
  }

  async removePolicy(
    policy: string[],
    source: Source,
    modifiedBy: string,
    isUpdate?: boolean,
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

        const auditOptions = createAuditPermissionOptions(
          [policy],
          'DELETE',
          source,
          modifiedBy,
          { removed: [policy] },
        );
        await this.aLog.auditLog(auditOptions);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      if (!isUpdate) {
        await this.aLog.auditErrorLog({
          eventName: PermissionEvents.DELETE_POLICY_ERROR,
          message: 'Error deleting policy',
          stage: 'rollback',
          actorId: modifiedBy,
          errors: [err],
          metadata: { policy, source },
        });
      }
      throw err;
    }
  }

  async removePolicies(
    policies: string[][],
    source: Source,
    modifiedBy: string,
    isUpdate?: boolean,
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

        const auditOptions = createAuditPermissionOptions(
          policies,
          'DELETE',
          source,
          modifiedBy,
          { removed: policies },
        );
        await this.aLog.auditLog(auditOptions);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      if (!isUpdate) {
        await this.aLog.auditErrorLog({
          eventName: PermissionEvents.DELETE_POLICY_ERROR,
          message: 'Error deleting policies',
          stage: 'rollback',
          actorId: modifiedBy,
          errors: [err],
          metadata: { policies, source },
        });
      }
      throw err;
    }
  }

  async removeGroupingPolicy(
    policy: string[],
    roleMetadata: RoleMetadataDao,
    isUpdate: boolean,
    allowToDeleCSVFilePolicy?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const roleEntity = policy[1];

    let operation: Operation | undefined;
    try {
      await this.checkIfPolicyModifiable(
        policy,
        roleMetadata.source,
        trx,
        allowToDeleCSVFilePolicy,
      );

      await this.policyMetadataStorage.removePolicyMetadata(policy, trx);
      const ok = await this.enforcer.removeGroupingPolicy(...policy);
      if (!ok) {
        throw new Error(`Failed to delete policy ${policyToString(policy)}`);
      }

      const remainingGroupPolicies =
        await this.enforcer.getFilteredGroupingPolicy(1, roleEntity);

      const currentRoleMetadata =
        await this.roleMetadataStorage.findRoleMetadata(roleEntity, trx);
      if (!isUpdate) {
        if (currentRoleMetadata && remainingGroupPolicies.length === 0) {
          if (roleEntity === ADMIN_ROLE_NAME) {
            // don't remove admin role metadata
            operation = 'UPDATE';
          } else {
            operation = 'DELETE';
            await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
          }
        } else if (currentRoleMetadata) {
          operation = 'UPDATE';
          const actualRoleMetadata = this.mergeMetadata(
            currentRoleMetadata,
            roleMetadata,
          );
          await this.roleMetadataStorage.updateRoleMetadata(
            actualRoleMetadata,
            roleEntity,
            trx,
          );
        }
      }

      if (!externalTrx) {
        await trx.commit();

        if (!isUpdate && operation) {
          const auditOptions = createAuditRoleOptions(
            operation,
            roleMetadata,
            { removed: [policy[0]] },
            currentRoleMetadata,
          );
          await this.aLog.auditLog(auditOptions);
        }
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);

        if (!isUpdate) {
          await this.aLog.auditErrorLog({
            eventName: RoleEvents.DELETE_OR_UPDATE_ROLE_ERROR,
            message: `Error deleting grouping policy for role ${roleEntity}`,
            stage: 'rollback',
            actorId: roleMetadata.modifiedBy,
            errors: [err],
            metadata: { policy, roleEntity, source: roleMetadata.source },
          });
        }
      }
      throw err;
    }
  }

  async removeGroupingPolicies(
    policies: string[][],
    roleMetadata: RoleMetadataDao,
    allowToDeleteCSVFilePolicy?: boolean,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());

    const roleEntity = roleMetadata.roleEntityRef;
    let operation: Operation | undefined;
    try {
      for (const policy of policies) {
        await this.checkIfPolicyModifiable(
          policy,
          roleMetadata.source,
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

      const remainingGroupPolicies =
        await this.enforcer.getFilteredGroupingPolicy(1, roleEntity);
      const currentRoleMetadata =
        await this.roleMetadataStorage.findRoleMetadata(roleEntity, trx);
      if (!isUpdate) {
        if (currentRoleMetadata && remainingGroupPolicies.length === 0) {
          if (roleEntity === ADMIN_ROLE_NAME) {
            // don't remove admin role metadata
            operation = 'UPDATE';
          } else {
            operation = 'DELETE';
            await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
          }
        } else if (currentRoleMetadata) {
          operation = 'UPDATE';
          const actualRoleMetadata = this.mergeMetadata(
            currentRoleMetadata,
            roleMetadata,
          );
          await this.roleMetadataStorage.updateRoleMetadata(
            actualRoleMetadata,
            roleEntity,
            trx,
          );
        }
      }

      if (!externalTrx) {
        await trx.commit();

        if (!isUpdate && operation) {
          const auditOptions = createAuditRoleOptions(
            operation,
            roleMetadata,
            { removed: policies.map(p => p[0]) },
            roleMetadata,
          );
          await this.aLog.auditLog(auditOptions);
        }
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);

        if (!isUpdate) {
          await this.aLog.auditErrorLog({
            eventName: RoleEvents.DELETE_OR_UPDATE_ROLE_ERROR,
            message: `Error deleting grouping policies for role: ${roleMetadata.roleEntityRef}`,
            stage: 'rollback',
            actorId: roleMetadata.modifiedBy,
            errors: [err],
            metadata: {
              policies,
              roleEntity: roleMetadata.roleEntityRef,
              source: roleMetadata.source,
            },
          });
        }
      }

      throw err;
    }
  }

  async addOrUpdatePolicy(
    policy: string[],
    source: Source,
    modifiedBy: string,
    isCSV: boolean,
  ): Promise<void> {
    const trx = await this.knex.transaction();
    let operation: Operation | undefined;
    try {
      if (!(await this.enforcer.hasPolicy(...policy))) {
        operation = 'CREATE';
        await this.addPolicy(policy, source, modifiedBy, trx);
      } else if (await this.hasFilteredPolicyMetadata(policy, 'legacy', trx)) {
        operation = 'UPDATE';
        await this.removePolicy(policy, source, modifiedBy, true, isCSV, trx);
        await this.addPolicy(policy, source, modifiedBy, trx);
      }

      await trx.commit();
      if (operation) {
        const diff: PermissionDiff =
          operation === 'CREATE' ? { added: [policy] } : { updated: [policy] };
        const auditOptions = createAuditPermissionOptions(
          [policy],
          operation,
          source,
          modifiedBy,
          diff,
        );
        await this.aLog.auditLog(auditOptions);
      }
    } catch (err) {
      await trx.rollback(err);

      await this.aLog.auditErrorLog({
        eventName: PermissionEvents.CREATE_OR_UPDATE_POLICY_ERROR,
        message: `Error 'creating' or 'updating' policy`,
        stage: 'rollback',
        actorId: modifiedBy,
        errors: [err],
        metadata: { policy, source },
      });
      throw err;
    }
  }

  async addOrUpdateGroupingPolicy(
    groupPolicy: string[],
    roleMetadata: RoleMetadataDao,
    isCSV?: boolean,
  ): Promise<void> {
    const isGroupPolicyPresent = await this.hasGroupingPolicy(...groupPolicy);
    if (!isGroupPolicyPresent) {
      await this.addGroupingPolicy(groupPolicy, roleMetadata);
      // addGroupingPolicy will make audit log itself
      return;
    }

    // handle legacy group policy
    const trx = await this.knex.transaction();
    try {
      const oldRoleMetadata = await this.roleMetadataStorage.findRoleMetadata(
        roleMetadata.roleEntityRef,
        trx,
      );
      const isLegacy = await this.hasFilteredPolicyMetadata(
        groupPolicy,
        'legacy',
        trx,
      );
      if (isGroupPolicyPresent && isLegacy) {
        await this.removeGroupingPolicy(
          groupPolicy,
          roleMetadata,
          true,
          isCSV,
          trx,
        );
        await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
      }

      await trx.commit();

      const auditOptions = createAuditRoleOptions(
        // we updated only source
        'UPDATE',
        roleMetadata,
        { updated: [groupPolicy[0]] },
        oldRoleMetadata,
      );
      await this.aLog.auditLog(auditOptions);
    } catch (err) {
      await trx.rollback(err);

      await this.aLog.auditErrorLog({
        eventName: RoleEvents.UPDATE_ROLE,
        message: `Error 'updating' grouping policy for role: ${roleMetadata.roleEntityRef}`,
        stage: 'rollback',
        actorId: roleMetadata.modifiedBy,
        errors: [err],
        metadata: {
          groupPolicy,
          roleEntity: roleMetadata.roleEntityRef,
          source: roleMetadata.source,
        },
      });
      throw err;
    }
  }

  async addOrUpdateGroupingPolicies(
    groupPolicies: string[][],
    roleMetadata: RoleMetadataDao,
    isCSV?: boolean,
  ): Promise<void> {
    const trx = await this.knex.transaction();
    try {
      const oldRoleMetadata = await this.roleMetadataStorage.findRoleMetadata(
        roleMetadata.roleEntityRef,
        trx,
      );
      const addedMembers = [];
      const updatedMembers = [];
      for (const groupPolicy of groupPolicies) {
        const isGroupPolicyPresent = await this.hasGroupingPolicy(
          ...groupPolicy,
        );
        if (!isGroupPolicyPresent) {
          await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
          addedMembers.push(groupPolicy[0]);
        }
        const isLegacy = await this.hasFilteredPolicyMetadata(
          groupPolicy,
          'legacy',
          trx,
        );
        if (isGroupPolicyPresent && isLegacy) {
          await this.removeGroupingPolicy(
            groupPolicy,
            roleMetadata,
            true,
            isCSV,
            trx,
          );
          await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
          updatedMembers.push(groupPolicy[0]);
        }
      }

      await trx.commit();

      const operation = oldRoleMetadata ? 'UPDATE' : 'CREATE';
      const auditOption = createAuditRoleOptions(
        operation,
        roleMetadata,
        { added: addedMembers, updated: updatedMembers },
        oldRoleMetadata,
      );
      await this.aLog.auditLog(auditOption);
    } catch (err) {
      await trx.rollback(err);

      await this.aLog.auditErrorLog({
        eventName: RoleEvents.CREATE_OR_UPDATE_ROLE_ERROR,
        message: `Error creating or updating role ${roleMetadata.roleEntityRef}`,
        stage: 'rollback',
        actorId: roleMetadata.modifiedBy,
        errors: [err],
        metadata: {
          groupPolicies,
          roleEntity: roleMetadata.roleEntityRef,
          source: roleMetadata.source,
        },
      });
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
        )}'. This policy cannot be altered directly. If you need to make changes, consider removing the associated RBAC admin '${
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

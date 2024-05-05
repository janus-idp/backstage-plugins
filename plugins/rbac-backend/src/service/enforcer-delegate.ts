import { NotAllowedError, NotFoundError } from '@backstage/errors';

import { Enforcer, newModelFromString } from 'casbin';
import { Knex } from 'knex';

import {
  PermissionPolicyMetadata,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { AuditLogger, Operation } from '../audit-log/audit-logger';
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
        this.aLog.permissionInfo([policy], 'CREATE', source, modifiedBy);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
        this.aLog.permissionError(
          [policy],
          ['CREATE'],
          source,
          modifiedBy,
          err,
        );
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
        this.aLog.permissionInfo(policies, 'CREATE', source, modifiedBy);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
        this.aLog.permissionError(
          policies,
          ['CREATE'],
          source,
          modifiedBy,
          err,
        );
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

    let operation: Operation | undefined;
    try {
      await this.policyMetadataStorage.createPolicyMetadata(
        roleMetadata.source,
        policy,
        trx,
      );

      let currentMetadata;
      if (entityRef.startsWith(`role:`)) {
        currentMetadata = await this.roleMetadataStorage.findRoleMetadata(
          entityRef,
          trx,
        );
      }

      if (currentMetadata) {
        operation = 'UPDATE';
        await this.roleMetadataStorage.updateRoleMetadata(
          this.mergeMetadata(currentMetadata, roleMetadata),
          entityRef,
          trx,
        );
      } else {
        operation = 'CREATE';
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
        this.aLog.roleInfo(roleMetadata, operation);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);

        this.aLog.roleError(
          roleMetadata.roleEntityRef,
          operation ? [operation] : ['CREATE', 'UPDATE'],
          err,
          roleMetadata.source,
          roleMetadata.modifiedBy,
        );
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
    let operation: Operation | undefined;
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
      if (currentRoleMetadata) {
        operation = 'UPDATE';
        await this.roleMetadataStorage.updateRoleMetadata(
          this.mergeMetadata(currentRoleMetadata, roleMetadata),
          roleMetadata.roleEntityRef,
          trx,
        );
      } else {
        operation = 'CREATE';
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
        this.aLog.roleInfo(roleMetadata, operation);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);

        this.aLog.roleError(
          roleMetadata.roleEntityRef,
          operation ? [operation] : ['CREATE', 'UPDATE'],
          err,
          roleMetadata.source,
          roleMetadata.modifiedBy,
        );
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
    const trx = await this.knex.transaction();
    const oldRoleName = oldRole.at(0)?.at(1)!;
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
        newRoleMetadata.source,
        newRoleMetadata.modifiedBy,
        allowToDeleteCSVFilePolicy,
        true,
        trx,
      );
      await this.addGroupingPolicies(newRole, newRoleMetadata, trx);

      await trx.commit();
      this.aLog.roleInfo(newRoleMetadata, 'UPDATE');
    } catch (err) {
      await trx.rollback(err);

      this.aLog.roleError(
        newRoleMetadata.roleEntityRef,
        ['UPDATE'],
        err,
        newRoleMetadata.source,
        newRoleMetadata.modifiedBy,
      );
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

      this.aLog.permissionInfo(
        newPolicies,
        'UPDATE',
        source,
        modifiedBy,
        oldPolicies,
      );
    } catch (err) {
      await trx.rollback(err);
      this.aLog.permissionError(
        newPolicies,
        ['UPDATE'],
        source,
        modifiedBy,
        err,
      );
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
      }
      if (!isUpdate) {
        this.aLog.permissionInfo([policy], 'DELETE', source, modifiedBy);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      if (!isUpdate) {
        this.aLog.permissionError(
          [policy],
          ['DELETE'],
          source,
          modifiedBy,
          err,
        );
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
      }
      if (!isUpdate) {
        this.aLog.permissionInfo(policies, 'DELETE', source, modifiedBy);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      if (!isUpdate) {
        this.aLog.permissionError(
          policies,
          ['DELETE'],
          source,
          modifiedBy,
          err,
        );
      }
      throw err;
    }
  }

  async removeGroupingPolicy(
    policy: string[],
    roleMetadata: RoleMetadataDao,
    isUpdate?: boolean,
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

      if (!isUpdate) {
        const currentRoleMetadata =
          await this.roleMetadataStorage.findRoleMetadata(roleEntity, trx);
        const groupPolicies = await this.enforcer.getFilteredGroupingPolicy(
          1,
          roleEntity,
        );
        if (
          currentRoleMetadata &&
          groupPolicies.length === 0 &&
          roleEntity !== ADMIN_ROLE_NAME
        ) {
          operation = 'DELETE';
          await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
        } else if (currentRoleMetadata) {
          operation = 'UPDATE';
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
      if (!isUpdate && operation) {
        this.aLog.roleInfo(roleMetadata, operation);
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      if (!isUpdate) {
        this.aLog.roleError(
          roleEntity,
          operation ? [operation] : ['UPDATE', 'DELETE'],
          err,
          roleMetadata.source,
          roleMetadata.modifiedBy!,
        );
      }
      throw err;
    }
  }

  async removeGroupingPolicies(
    policies: string[][],
    source: Source,
    modifiedBy?: string,
    allowToDeleteCSVFilePolicy?: boolean,
    isUpdate?: boolean,
    externalTrx?: Knex.Transaction,
  ): Promise<void> {
    const trx = externalTrx ?? (await this.knex.transaction());
    const roles = new Set<string>(
      policies
        .map(policy => policy[1])
        .filter(policy => policy.startsWith('role:default')),
    );
    try {
      for (const policy of policies) {
        await this.checkIfPolicyModifiable(
          policy,
          source,
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

      const roleOperations = new Map<RoleMetadataDao, Operation>();
      for (const roleEntity of roles) {
        if (!isUpdate) {
          const roleMetadata = await this.roleMetadataStorage.findRoleMetadata(
            roleEntity,
            trx,
          );
          const groupPolicies = await this.enforcer.getFilteredGroupingPolicy(
            1,
            roleEntity,
          );
          if (
            roleMetadata &&
            groupPolicies.length === 0 &&
            roleEntity !== ADMIN_ROLE_NAME
          ) {
            roleOperations.set(roleMetadata, 'DELETE');
            await this.roleMetadataStorage.removeRoleMetadata(roleEntity, trx);
          } else if (roleMetadata) {
            roleOperations.set(roleMetadata, 'UPDATE');
            roleMetadata.modifiedBy = modifiedBy;
            roleMetadata.lastModified = new Date().toUTCString();
            await this.roleMetadataStorage.updateRoleMetadata(
              roleMetadata,
              roleEntity,
              trx,
            );
          }
        }
      }

      if (!externalTrx) {
        await trx.commit();
      }
      if (!isUpdate) {
        for (const entry of roleOperations.entries()) {
          this.aLog.roleInfo(entry[0], entry[1]);
        }
      }
    } catch (err) {
      if (!externalTrx) {
        await trx.rollback(err);
      }
      if (!isUpdate) {
        this.aLog.roleError(
          Array.from(roles),
          ['UPDATE', 'DELETE'],
          err,
          source,
          modifiedBy,
        );
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
        this.aLog.permissionInfo([policy], operation, source, modifiedBy);
      }
    } catch (err) {
      await trx.rollback(err);

      const operations: Operation[] = operation
        ? [operation]
        : ['CREATE', 'UPDATE'];
      this.aLog.permissionError([policy], operations, source, modifiedBy, err);
      throw err;
    }
  }

  async addOrUpdateGroupingPolicy(
    groupPolicy: string[],
    roleMetadata: RoleMetadataDao,
    isCSV?: boolean,
  ): Promise<void> {
    const trx = await this.knex.transaction();
    let operation: Operation | undefined;
    try {
      if (!(await this.hasGroupingPolicy(...groupPolicy))) {
        operation = 'CREATE';
        await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
      } else if (
        await this.hasFilteredPolicyMetadata(groupPolicy, 'legacy', trx)
      ) {
        operation = 'UPDATE';
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

      if (operation) {
        this.aLog.roleInfo(roleMetadata, operation);
      }
    } catch (err) {
      await trx.rollback(err);

      const operations: Operation[] = operation
        ? [operation]
        : ['CREATE', 'UPDATE'];
      this.aLog.roleError(
        roleMetadata.roleEntityRef,
        operations,
        err,
        roleMetadata.source,
        roleMetadata.modifiedBy,
      );
      throw err;
    }
  }

  async addOrUpdateGroupingPolicies(
    groupPolicies: string[][],
    roleMetadata: RoleMetadataDao,
    isCSV?: boolean,
  ): Promise<void> {
    const trx = await this.knex.transaction();
    let operation: Operation | undefined;
    try {
      for (const groupPolicy of groupPolicies) {
        if (!(await this.hasGroupingPolicy(...groupPolicy))) {
          operation = 'CREATE';
          await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
        } else if (
          await this.hasFilteredPolicyMetadata(groupPolicy, 'legacy', trx)
        ) {
          operation = 'UPDATE';
          await this.removeGroupingPolicy(
            groupPolicy,
            roleMetadata,
            true,
            isCSV,
            trx,
          );
          await this.addGroupingPolicy(groupPolicy, roleMetadata, trx);
        }
      }

      await trx.commit();

      if (operation) {
        this.aLog.roleInfo(roleMetadata, operation);
      }
    } catch (err) {
      await trx.rollback(err);

      const operations: Operation[] = operation
        ? [operation]
        : ['CREATE', 'UPDATE'];
      this.aLog.roleError(
        roleMetadata.roleEntityRef,
        operations,
        err,
        roleMetadata.source,
        roleMetadata.modifiedBy,
      );
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

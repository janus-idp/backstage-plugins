import { Config } from '@backstage/config';
import { ConfigApi } from '@backstage/core-plugin-api';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  isResourcePermission,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';

import { Enforcer, FileAdapter, newEnforcer, newModelFromString } from 'casbin';
import { Knex } from 'knex';
import { isEqual } from 'lodash';
import { Logger } from 'winston';

import { Source } from '@janus-idp/backstage-plugin-rbac-common';

import { ConditionalStorage } from '../database/conditional-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { metadataStringToPolicy } from '../helper';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import {
  validateAllPredefinedPolicies,
  validateEntityReference,
} from './policies-validation';

const adminRoleName = 'role:default/rbac_admin';

async function addRoleMetadata(
  groupPolicy: string[],
  source: Source,
  roleMetadataStorage: RoleMetadataStorage,
  trx: Knex.Transaction,
) {
  const entityRef = groupPolicy[1];
  if (entityRef.startsWith(`role:`)) {
    const metadata = await roleMetadataStorage.findRoleMetadata(entityRef, trx);
    if (!metadata) {
      await roleMetadataStorage.createRoleMetadata({ source }, entityRef, trx);
    }
  }
}

const useAdmins = async (
  admins: Config[],
  enf: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
  knex: Knex,
) => {
  const rbacAdminsGroupPolicies: string[][] = [];
  admins.flatMap(async localConfig => {
    const entityRef = localConfig.getString('name');
    validateEntityReference(entityRef);

    const groupPolicy = [entityRef, adminRoleName];
    if (!(await enf.hasGroupingPolicy(...groupPolicy))) {
      rbacAdminsGroupPolicies.push(groupPolicy);
    }
  });

  const trx = await knex.transaction();
  try {
    const adminRoleMeta = await roleMetadataStorage.findRoleMetadata(
      adminRoleName,
      trx,
    );
    if (!adminRoleMeta) {
      await roleMetadataStorage.createRoleMetadata(
        { source: 'configuration' },
        adminRoleName,
        trx,
      );
    }

    // // todo: hmm... error: cannot to save policy, the adapter does not implement the BatchAdapter!
    // if (rbacAdminsGroupPolicies.length > 0) {
    //   await enf.addGroupingPolicies(rbacAdminsGroupPolicies, 'configuration', trx);
    // }
    for (const gPolicy of rbacAdminsGroupPolicies) {
      await enf.addGroupingPolicy(gPolicy, 'configuration', trx);
    }
    await trx.commit();
  } catch (err) {
    await trx.rollback(err);
    throw err;
  }

  const adminReadPermission = [adminRoleName, 'policy-entity', 'read', 'allow'];
  if (!(await enf.hasPolicy(...adminReadPermission))) {
    await enf.addPolicy(adminReadPermission, 'configuration');
  }
  const adminCreatePermission = [
    adminRoleName,
    'policy-entity',
    'create',
    'allow',
  ];
  if (!(await enf.hasPolicy(...adminCreatePermission))) {
    await enf.addPolicy(adminCreatePermission, 'configuration');
  }

  const adminDeletePermission = [
    adminRoleName,
    'policy-entity',
    'delete',
    'allow',
  ];
  if (!(await enf.hasPolicy(...adminDeletePermission))) {
    await enf.addPolicy(adminDeletePermission, 'configuration');
  }

  const adminUpdatePermission = [
    adminRoleName,
    'policy-entity',
    'update',
    'allow',
  ];
  if (!(await enf.hasPolicy(...adminUpdatePermission))) {
    await enf.addPolicy(adminUpdatePermission, 'configuration');
  }

  // needed for rbac frontend.
  const adminCatalogReadPermission = [
    adminRoleName,
    'catalog-entity',
    'read',
    'allow',
  ];
  if (!(await enf.hasPolicy(...adminCatalogReadPermission))) {
    await enf.addPolicy(...adminCatalogReadPermission);
  }
};

const removedOldPermissionPoliciesFileData = async (
  enf: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
  knex: Knex,
  fileEnf?: Enforcer,
): Promise<void> => {
  let policiesToDelete: string[][] = [];
  let groupPoliciesToDelete: string[][] = [];

  const policiesMetadata = await enf.getFilteredPolicyMetadata('csv-file');
  for (const policyMetadata of policiesMetadata) {
    const policy = metadataStringToPolicy(policyMetadata.policy);
    if (policy.length === 2) {
      groupPoliciesToDelete.push(policy);
    } else {
      policiesToDelete.push(policy);
    }
  }

  let rolesToDelete = new Set(
    groupPoliciesToDelete
      .filter(gp => gp[1].startsWith('role:'))
      .map(gp => gp[1]),
  );

  if (fileEnf) {
    groupPoliciesToDelete = await groupPoliciesToDelete.filter(
      async gp => !(await fileEnf.hasGroupingPolicy(...gp)),
    );
    policiesToDelete = await policiesToDelete.filter(
      async p => !(await fileEnf.hasPolicy(...p)),
    );

    const actualFileRoles = await fileEnf.getAllRoles();
    rolesToDelete = new Set(
      Array.from(rolesToDelete).filter(
        role => !actualFileRoles.some(actualRole => isEqual(actualRole, role)),
      ),
    );
  }

  const trx = await knex.transaction();
  try {
    if (groupPoliciesToDelete.length > 0) {
      await enf.removeGroupingPolicies(groupPoliciesToDelete, true, trx);
    }
    if (policiesToDelete.length > 0) {
      await enf.removePolicies(policiesToDelete, true, trx);
    }
    for (const roleMeta of rolesToDelete) {
      const isRoleUnUsed =
        (await enf.getFilteredGroupingPolicy(1, ...[roleMeta])).length === 0;

      if (
        (await roleMetadataStorage.findRoleMetadata(roleMeta)) &&
        isRoleUnUsed
      ) {
        await roleMetadataStorage.removeRoleMetadata(roleMeta, trx);
      }
    }
    await trx.commit();
  } catch (err) {
    await trx.rollback(err);
    throw err;
  }
};

const addPermissionPoliciesFileData = async (
  preDefinedPoliciesFile: string,
  enf: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
  knex: Knex,
) => {
  const fileEnf = await newEnforcer(
    newModelFromString(MODEL),
    new FileAdapter(preDefinedPoliciesFile),
  );
  const policies = await fileEnf.getPolicy();
  const groupPolicies = await fileEnf.getGroupingPolicy();

  await validateAllPredefinedPolicies(
    Array.from(policies),
    Array.from(groupPolicies),
    preDefinedPoliciesFile,
    roleMetadataStorage,
  );

  await removedOldPermissionPoliciesFileData(
    enf,
    roleMetadataStorage,
    knex,
    fileEnf,
  );

  for (const policy of policies) {
    if (!(await enf.hasPolicy(...policy))) {
      await enf.addPolicy(policy, 'csv-file');
    }
  }

  for (const groupPolicy of groupPolicies) {
    if (!(await enf.hasGroupingPolicy(...groupPolicy))) {
      const trx = await knex.transaction();
      try {
        await addRoleMetadata(
          groupPolicy,
          'csv-file',
          roleMetadataStorage,
          trx,
        );
        await enf.addGroupingPolicy(groupPolicy, 'csv-file', trx);
        await trx.commit();
      } catch (err) {
        await trx.rollback(err);
        throw err;
      }
    }
  }
};

export class RBACPermissionPolicy implements PermissionPolicy {
  private readonly enforcer: EnforcerDelegate;
  private readonly logger: Logger;
  private readonly conditionStorage: ConditionalStorage;

  public static async build(
    logger: Logger,
    configApi: ConfigApi,
    conditionalStorage: ConditionalStorage,
    enforcerDelegate: EnforcerDelegate,
    roleMetadataStorage: RoleMetadataStorage,
    knex: Knex,
  ): Promise<RBACPermissionPolicy> {
    const adminUsers = configApi.getOptionalConfigArray(
      'permission.rbac.admin.users',
    );

    const policiesFile = configApi.getOptionalString(
      'permission.rbac.policies-csv-file',
    );

    if (policiesFile) {
      await addPermissionPoliciesFileData(
        policiesFile,
        enforcerDelegate,
        roleMetadataStorage,
        knex,
      );
    } else {
      await removedOldPermissionPoliciesFileData(
        enforcerDelegate,
        roleMetadataStorage,
        knex,
      );
    }

    if (adminUsers) {
      await useAdmins(adminUsers, enforcerDelegate, roleMetadataStorage, knex);
    }

    return new RBACPermissionPolicy(
      enforcerDelegate,
      logger,
      conditionalStorage,
    );
  }

  private constructor(
    enforcer: EnforcerDelegate,
    logger: Logger,
    conditionStorage: ConditionalStorage,
  ) {
    this.enforcer = enforcer;
    this.logger = logger;
    this.conditionStorage = conditionStorage;
  }

  async handle(
    request: PolicyQuery,
    identityResp?: BackstageIdentityResponse | undefined,
  ): Promise<PolicyDecision> {
    this.logger.info(
      `Policy check for ${identityResp?.identity.userEntityRef} for permission ${request.permission.name}`,
    );
    try {
      let status = false;

      // We are introducing an action named "use" when action does not exist to avoid
      // a more complicated model with multiple policy and request shapes.
      const action = request.permission.attributes.action ?? 'use';

      if (!identityResp?.identity) {
        return { result: AuthorizeResult.DENY };
      }

      const userEntityRef = identityResp.identity.userEntityRef;
      const permissionName = request.permission.name;

      if (isResourcePermission(request.permission)) {
        const resourceType = request.permission.resourceType;
        const hasNamedPermission =
          await this.hasImplicitPermissionSpecifiedByName(
            userEntityRef,
            permissionName,
            action,
          );
        // Let's set up higher priority for permission specified by name, than by resource type
        const obj = hasNamedPermission ? permissionName : resourceType;

        status = await this.enforcer.enforce(userEntityRef, obj, action);

        if (status && identityResp) {
          const conditionalDecision =
            await this.conditionStorage.findCondition(resourceType);
          if (conditionalDecision) {
            this.logger.info(
              `${identityResp?.identity.userEntityRef} executed condition for permission ${request.permission.name}, resource type ${resourceType} and action ${action}`,
            );
            return conditionalDecision;
          }
        }
      } else {
        status = await this.enforcer.enforce(
          userEntityRef,
          permissionName,
          action,
        );
      }

      const result = status ? AuthorizeResult.ALLOW : AuthorizeResult.DENY;
      this.logger.info(
        `${userEntityRef} is ${result} for permission '${
          request.permission.name
        }'${
          isResourcePermission(request.permission)
            ? `, resource type '${request.permission.resourceType}'`
            : ''
        } and action ${action}`,
      );
      return Promise.resolve({
        result: result,
      });
    } catch (error) {
      this.logger.error(`Policy check failed with ${error}`);
      return Promise.resolve({
        result: AuthorizeResult.DENY,
      });
    }
  }

  private async hasImplicitPermissionSpecifiedByName(
    userEntityRef: string,
    permissionName: string,
    action: string,
  ): Promise<boolean> {
    const userPerms =
      await this.enforcer.getImplicitPermissionsForUser(userEntityRef);
    for (const perm of userPerms) {
      if (permissionName === perm[1] && action === perm[2]) {
        return true;
      }
    }
    return false;
  }
}

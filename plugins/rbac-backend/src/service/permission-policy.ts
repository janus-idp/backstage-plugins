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

import { FileAdapter, newEnforcer, newModelFromString } from 'casbin';
import { Logger } from 'winston';

import { Location } from '@janus-idp/backstage-plugin-rbac-common';

import { ConditionalStorage } from '../database/conditional-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import { validateEntityReference } from './policies-validation';

async function addRoleMetadata(
  groupPolicies: string[][],
  location: Location,
  roleMetadataStorage: RoleMetadataStorage,
) {
  const roles = new Set<string>();
  groupPolicies
    .filter(policy => policy[1].startsWith(`role:`))
    .forEach(policy => roles.add(policy[1]));
  console.log(`==== ${JSON.stringify(roles.values().next())}`);

  for (const role of roles) {
    await roleMetadataStorage.createRoleMetadata({ location }, role);
  }
}

const useAdmins = async (
  admins: Config[],
  enf: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
) => {
  const adminRoleName = 'role:default/rbac_admin';
  admins.flatMap(async localConfig => {
    const name = localConfig.getString('name');
    const adminRole = [name, adminRoleName];
    if (!(await enf.hasGroupingPolicy(...adminRole))) {
      await enf.addGroupingPolicy(adminRole, 'pre-defined');
      await addRoleMetadata([adminRole], 'pre-defined', roleMetadataStorage);
    }
  });
  const adminReadPermission = [adminRoleName, 'policy-entity', 'read', 'allow'];
  if (!(await enf.hasPolicy(...adminReadPermission))) {
    await enf.addPolicy(adminReadPermission, 'pre-defined');
  }
  const adminCreatePermission = [
    adminRoleName,
    'policy-entity',
    'create',
    'allow',
  ];
  if (!(await enf.hasPolicy(...adminCreatePermission))) {
    await enf.addPolicy(adminCreatePermission, 'pre-defined');
  }

  const adminDeletePermission = [
    adminRoleName,
    'policy-entity',
    'delete',
    'allow',
  ];
  if (!(await enf.hasPolicy(...adminDeletePermission))) {
    await enf.addPolicy(adminDeletePermission, 'pre-defined');
  }

  const adminUpdatePermission = [
    adminRoleName,
    'policy-entity',
    'update',
    'allow',
  ];
  if (!(await enf.hasPolicy(...adminUpdatePermission))) {
    await enf.addPolicy(adminUpdatePermission, 'pre-defined');
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

const addPredefinedPoliciesAndGroupPolicies = async (
  preDefinedPoliciesFile: string,
  enf: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
) => {
  const fileEnf = await newEnforcer(
    newModelFromString(MODEL),
    new FileAdapter(preDefinedPoliciesFile),
  );
  const policies = await fileEnf.getPolicy();
  for (const policy of policies) {
    const err = validateEntityReference(policy[0]);
    if (err) {
      throw new Error(
        `Failed to validate policy from file ${preDefinedPoliciesFile}. Cause: ${err.message}`,
      );
    }
    if (!(await enf.hasPolicy(...policy))) {
      await enf.addPolicy(policy, 'csv-file');
    }
  }
  const groupPolicies = await fileEnf.getGroupingPolicy();
  for (const groupPolicy of groupPolicies) {
    let err = validateEntityReference(groupPolicy[0]);
    if (err) {
      throw new Error(
        `Failed to validate group policy from file ${preDefinedPoliciesFile}. Cause: ${err.message}`,
      );
    }
    err = validateEntityReference(groupPolicy[1], true);
    if (err) {
      throw new Error(
        `Failed to validate group policy from file ${preDefinedPoliciesFile}. Cause: ${err.message}`,
      );
    }
    if (!(await enf.hasGroupingPolicy(...groupPolicy))) {
      await enf.addGroupingPolicy(groupPolicy, 'csv-file');
      await addRoleMetadata([groupPolicy], 'csv-file', roleMetadataStorage);
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
  ): Promise<RBACPermissionPolicy> {
    const adminUsers = configApi.getOptionalConfigArray(
      'permission.rbac.admin.users',
    );

    const policiesFile = configApi.getOptionalString(
      'permission.rbac.policies-csv-file',
    );

    if (policiesFile) {
      await addPredefinedPoliciesAndGroupPolicies(
        policiesFile,
        enforcerDelegate,
        roleMetadataStorage,
      );
    }

    if (adminUsers) {
      useAdmins(adminUsers, enforcerDelegate, roleMetadataStorage);
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

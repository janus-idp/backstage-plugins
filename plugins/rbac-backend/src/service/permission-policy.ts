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
import { Knex } from 'knex';
import { Logger } from 'winston';

import { RoleSource, Source } from '@janus-idp/backstage-plugin-rbac-common';

import { ConditionalStorage } from '../database/conditional-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import { metadataStringToPolicy } from '../helper';
import { EnforcerDelegate } from './enforcer-delegate';
import { MODEL } from './permission-model';
import { validateEntityReference } from './policies-validation';

async function addRoleMetadata(
  groupPolicy: string[],
  source: RoleSource,
  roleMetadataStorage: RoleMetadataStorage,
  trx: Knex.Transaction,
) {
  const entityRef = groupPolicy[1];
  if (entityRef.startsWith(`role:`)) {
    const metadata = await roleMetadataStorage.findRoleMetadata(entityRef);
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
  const adminRoleName = 'role:default/rbac_admin';

  const adminRoleMeta =
    await roleMetadataStorage.findRoleMetadata(adminRoleName);
  if (!adminRoleMeta) {
    const trx = await knex.transaction();
    await roleMetadataStorage.createRoleMetadata(
      { source: 'default' },
      adminRoleName,
      trx,
    );
    trx.commit();
  }

  admins.flatMap(async localConfig => {
    const name = localConfig.getString('name');
    const adminRole = [name, adminRoleName];
    if (!(await enf.hasGroupingPolicy(...adminRole))) {
      await enf.addGroupingPolicy(adminRole, 'configuration');
    }
  });

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

const addPredefinedPoliciesAndGroupPolicies = async (
  preDefinedPoliciesFile: string,
  enf: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
  knex: Knex,
) => {
  const fileEnf = await newEnforcer(
    newModelFromString(MODEL),
    new FileAdapter(preDefinedPoliciesFile),
  );
  const policies = new Set<string[]>(await fileEnf.getPolicy());
  const groupPolicies = new Set<string[]>(await fileEnf.getGroupingPolicy());

  const oldFilePolicies = new Set<string[]>();
  const policiesMetadata = await enf.getFilteredPolicyMetadata('csv-file');
  for (const policyMetadata of policiesMetadata) {
    oldFilePolicies.add(metadataStringToPolicy(policyMetadata.policy));
  }

  const policiesToDelete: string[][] = [];
  const groupPoliciesToDelete: string[][] = [];
  for (const oldFilePolicy of oldFilePolicies) {
    if (oldFilePolicy.length === 2 && !groupPolicies.has(oldFilePolicy)) {
      groupPoliciesToDelete.push(oldFilePolicy);
    } else if (!policies.has(oldFilePolicy)) {
      policiesToDelete.push(oldFilePolicy);
    }
  }

  const rolesToDelete = new Set<string>();
  groupPoliciesToDelete
    .filter(gp => gp[1].startsWith(`role:`))
    .forEach(gp => {
      rolesToDelete.add(gp[1]);
    });
  for (const gp of groupPolicies) {
    if (rolesToDelete.has(gp[1])) {
      rolesToDelete.delete(gp[1]);
    }
  }

  const delRoleMetaTrx = await knex.transaction();
  try {
    for (const roleMeta of rolesToDelete) {
      await roleMetadataStorage.removeRoleMetadata(roleMeta, delRoleMetaTrx);
    }
    await enf.removeGroupingPolicies(groupPoliciesToDelete, true);
    delRoleMetaTrx.commit();
  } catch (err) {
    delRoleMetaTrx.rollback();
    throw err;
  }
  await enf.removePolicies(policiesToDelete, true);

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

  for (const groupPolicy of groupPolicies) {
    if (!(await enf.hasGroupingPolicy(...groupPolicy))) {
      await validateGroupingPolicy(
        groupPolicy,
        preDefinedPoliciesFile,
        roleMetadataStorage,
        `csv-file`,
      );
      const trx = await knex.transaction();
      try {
        await addRoleMetadata(
          groupPolicy,
          'csv-file',
          roleMetadataStorage,
          trx,
        );
        await enf.addGroupingPolicy(groupPolicy, 'csv-file');
        trx.commit();
      } catch (err) {
        trx.rollback();
        throw err;
      }
    }
  }
};

async function validateGroupingPolicy(
  groupPolicy: string[],
  preDefinedPoliciesFile: string,
  roleMetadataStorage: RoleMetadataStorage,
  source: Source,
) {
  console.log(`validate policy: ${groupPolicy}}`);
  if (groupPolicy.length === 3) {
    throw new Error(`Group policy should has length 3`);
  }

  const member = groupPolicy[0];
  let err = validateEntityReference(member);
  if (err) {
    throw new Error(
      `Failed to validate group policy ${groupPolicy} from file ${preDefinedPoliciesFile}. Cause: ${err.message}`,
    );
  }
  const parent = groupPolicy[1];
  err = validateEntityReference(parent);
  if (err) {
    throw new Error(
      `Failed to validate group policy ${groupPolicy} from file ${preDefinedPoliciesFile}. Cause: ${err.message}`,
    );
  }
  if (member.startsWith(`role:`)) {
    throw new Error(
      `Group policy is invalid: ${groupPolicy}. rbac-backend plugin doesn't support role inheritance.`,
    );
  }
  if (member.startsWith(`group:`) && parent.startsWith(`group:`)) {
    throw new Error(
      `Group policy is invalid: ${groupPolicy}. Group inheritance information could be provided only with help of Catalog API.`,
    );
  }
  if (member.startsWith(`user:`) && parent.startsWith(`group:`)) {
    throw new Error(
      `Group policy is invalid: ${groupPolicy}. User membership information could be provided only with help of Catalog API.`,
    );
  }

  const metadata = await roleMetadataStorage.findRoleMetadata(parent);
  if (metadata && metadata.source !== source) {
    throw new Error(
      `You could not add user or group to the role created with source ${metadata.source}`,
    );
  }
}

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
      await addPredefinedPoliciesAndGroupPolicies(
        policiesFile,
        enforcerDelegate,
        roleMetadataStorage,
        knex,
      );
    }

    if (adminUsers) {
      useAdmins(adminUsers, enforcerDelegate, roleMetadataStorage, knex);
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

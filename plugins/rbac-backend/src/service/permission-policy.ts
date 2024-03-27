import { Config } from '@backstage/config';
import { ConfigApi } from '@backstage/core-plugin-api';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  isResourcePermission,
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
  PolicyDecision,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';

import { Knex } from 'knex';
import { Logger } from 'winston';

import { NonEmptyArray } from '@janus-idp/backstage-plugin-rbac-common';

import { ConditionalStorage } from '../database/conditional-storage';
import { PolicyMetadataStorage } from '../database/policy-metadata-storage';
import { RoleMetadataStorage } from '../database/role-metadata';
import {
  addPermissionPoliciesFileData,
  loadFilteredCSV,
  removedOldPermissionPoliciesFileData,
} from '../file-permissions/csv';
import { metadataStringToPolicy, removeTheDifference } from '../helper';
import { EnforcerDelegate } from './enforcer-delegate';
import { validateEntityReference } from './policies-validation';

const adminRoleName = 'role:default/rbac_admin';

const useAdminsFromConfig = async (
  admins: Config[],
  enf: EnforcerDelegate,
  roleMetadataStorage: RoleMetadataStorage,
  knex: Knex,
) => {
  const groupPoliciesToCompare: string[] = [];
  const addedGroupPolicies = new Map<string, string>();

  for (const admin of admins) {
    const entityRef = admin.getString('name');
    validateEntityReference(entityRef);

    addedGroupPolicies.set(entityRef, adminRoleName);
  }

  const adminRoleMeta =
    await roleMetadataStorage.findRoleMetadata(adminRoleName);

  const trx = await knex.transaction();
  try {
    if (!adminRoleMeta) {
      await roleMetadataStorage.createRoleMetadata(
        { source: 'configuration', roleEntityRef: adminRoleName },
        trx,
      );
    } else if (adminRoleMeta.source === 'legacy') {
      await roleMetadataStorage.removeRoleMetadata(adminRoleName, trx);
      await roleMetadataStorage.createRoleMetadata(
        { source: 'configuration', roleEntityRef: adminRoleName },
        trx,
      );
    }

    await trx.commit();
  } catch (error) {
    await trx.rollback(error);
    throw error;
  }

  await enf.addOrUpdateGroupingPolicies(
    Array.from<string[]>(addedGroupPolicies.entries()),
    'configuration',
    false,
  );

  const configPoliciesMetadata =
    await enf.getFilteredPolicyMetadata('configuration');

  for (const policyMetadata of configPoliciesMetadata) {
    if (metadataStringToPolicy(policyMetadata.policy).length === 2) {
      const stringPolicy = metadataStringToPolicy(policyMetadata.policy);
      groupPoliciesToCompare.push(stringPolicy.at(0)!);
    }
  }

  await removeTheDifference(
    groupPoliciesToCompare,
    Array.from<string>(addedGroupPolicies.keys()),
    'configuration',
    adminRoleName,
    enf,
  );
};

const setAdminPermissions = async (enf: EnforcerDelegate) => {
  const adminReadPermission = [adminRoleName, 'policy-entity', 'read', 'allow'];
  await enf.addOrUpdatePolicy(adminReadPermission, 'configuration', false);

  const adminCreatePermission = [
    adminRoleName,
    'policy-entity',
    'create',
    'allow',
  ];
  await enf.addOrUpdatePolicy(adminCreatePermission, 'configuration', false);

  const adminDeletePermission = [
    adminRoleName,
    'policy-entity',
    'delete',
    'allow',
  ];
  await enf.addOrUpdatePolicy(adminDeletePermission, 'configuration', false);

  const adminUpdatePermission = [
    adminRoleName,
    'policy-entity',
    'update',
    'allow',
  ];
  await enf.addOrUpdatePolicy(adminUpdatePermission, 'configuration', false);

  // needed for rbac frontend.
  const adminCatalogReadPermission = [
    adminRoleName,
    'catalog-entity',
    'read',
    'allow',
  ];
  await enf.addOrUpdatePolicy(
    adminCatalogReadPermission,
    'configuration',
    false,
  );
};

export class RBACPermissionPolicy implements PermissionPolicy {
  private readonly enforcer: EnforcerDelegate;
  private readonly logger: Logger;
  private readonly conditionStorage: ConditionalStorage;
  private readonly policyMetadataStorage: PolicyMetadataStorage;
  private readonly policiesFile?: string;
  private readonly allowReload?: boolean;
  private readonly superUserList?: string[];

  public static async build(
    logger: Logger,
    configApi: ConfigApi,
    conditionalStorage: ConditionalStorage,
    enforcerDelegate: EnforcerDelegate,
    roleMetadataStorage: RoleMetadataStorage,
    policyMetaDataStorage: PolicyMetadataStorage,
    knex: Knex,
  ): Promise<RBACPermissionPolicy> {
    const superUserList: string[] = [];
    const adminUsers = configApi.getOptionalConfigArray(
      'permission.rbac.admin.users',
    );

    const superUsers = configApi.getOptionalConfigArray(
      'permission.rbac.admin.superUsers',
    );

    const policiesFile = configApi.getOptionalString(
      'permission.rbac.policies-csv-file',
    );

    const allowReload = configApi.getOptionalBoolean(
      'permission.rbac.policyFileReload',
    );

    if (superUsers && superUsers.length > 0) {
      for (const user of superUsers) {
        const userName = user.getString('name');
        superUserList.push(userName);
      }
    }

    await useAdminsFromConfig(
      adminUsers || [],
      enforcerDelegate,
      roleMetadataStorage,
      knex,
    );
    await setAdminPermissions(enforcerDelegate);

    if (
      (!adminUsers || adminUsers.length === 0) &&
      (!superUsers || superUsers.length === 0)
    ) {
      logger.warn(
        'There are no admins or super admins configured for the RBAC-backend plugin.',
      );
    }

    if (policiesFile) {
      await addPermissionPoliciesFileData(
        policiesFile,
        enforcerDelegate,
        roleMetadataStorage,
        logger,
      );
    } else {
      await removedOldPermissionPoliciesFileData(enforcerDelegate);
    }

    return new RBACPermissionPolicy(
      enforcerDelegate,
      logger,
      conditionalStorage,
      policyMetaDataStorage,
      policiesFile,
      allowReload,
      superUserList,
    );
  }

  private constructor(
    enforcer: EnforcerDelegate,
    logger: Logger,
    conditionStorage: ConditionalStorage,
    policyMetadataStorage: PolicyMetadataStorage,
    policiesFile?: string,
    allowReload?: boolean,
    superUserList?: string[],
  ) {
    this.enforcer = enforcer;
    this.logger = logger;
    this.conditionStorage = conditionStorage;
    this.policyMetadataStorage = policyMetadataStorage;
    this.policiesFile = policiesFile;
    this.allowReload = allowReload;
    this.superUserList = superUserList;
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

        // handle conditions if they are present
        if (identityResp) {
          const conditionResult = await this.handleConditions(
            userEntityRef,
            resourceType,
            request.permission.name,
            action,
            identityResp,
          );
          if (conditionResult) {
            return conditionResult;
          }
        }

        // handle permission with 'resource' type
        const hasNamedPermission =
          await this.hasImplicitPermissionSpecifiedByName(
            userEntityRef,
            permissionName,
            action,
          );
        // Let's set up higher priority for permission specified by name, than by resource type
        const obj = hasNamedPermission ? permissionName : resourceType;

        status = await this.isAuthorized(userEntityRef, obj, action);
      } else {
        // handle permission with 'basic' type
        status = await this.isAuthorized(userEntityRef, permissionName, action);
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

  private isAuthorized = async (
    userIdentity: string,
    permission: string,
    action: string,
  ): Promise<boolean> => {
    if (this.superUserList!.includes(userIdentity)) {
      return true;
    }

    const filter: string[] = [userIdentity, permission, action];
    if (this.policiesFile && this.allowReload) {
      await loadFilteredCSV(
        this.policiesFile,
        this.enforcer,
        filter,
        this.logger,
        this.policyMetadataStorage,
      );
    }

    return await this.enforcer.enforce(userIdentity, permission, action);
  };

  private async handleConditions(
    userEntityRef: string,
    resourceType: string,
    permissionName: string,
    action: string,
    identityResp?: BackstageIdentityResponse | undefined,
  ): Promise<PolicyDecision | undefined> {
    const roles = await this.enforcer.getRolesForUser(userEntityRef);

    const conditions: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    >[] = [];
    let pluginId = '';
    for (const role of roles) {
      const conditionalDecisions = await this.conditionStorage.filterConditions(
        role,
        undefined,
        resourceType,
        [permissionName],
      );

      if (conditionalDecisions.length > 0) {
        pluginId = conditionalDecisions[0].pluginId;
        conditions.push(conditionalDecisions[0].conditions);
      }
    }

    if (conditions.length > 0) {
      this.logger.info(
        `${identityResp?.identity.userEntityRef} executed condition for permission ${permissionName}, resource type ${resourceType} and action ${action}`,
      );
      return {
        pluginId,
        result: AuthorizeResult.CONDITIONAL,
        resourceType,
        conditions: {
          anyOf: conditions as NonEmptyArray<
            PermissionCriteria<
              PermissionCondition<string, PermissionRuleParams>
            >
          >,
        },
      };
    }
    return undefined;
  }
}

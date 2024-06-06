import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { ConfigApi } from '@backstage/core-plugin-api';
import { BackstageIdentityResponse } from '@backstage/plugin-auth-node';
import {
  AuthorizeResult,
  ConditionalPolicyDecision,
  isResourcePermission,
  Permission,
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
  PolicyDecision,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  PermissionPolicy,
  PolicyQuery,
} from '@backstage/plugin-permission-node';

import { Knex } from 'knex';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  NonEmptyArray,
  toPermissionAction,
} from '@janus-idp/backstage-plugin-rbac-common';

import {
  createPermissionEvaluationOptions,
  EVALUATE_PERMISSION_ACCESS_STAGE,
  EvaluationEvents,
  HANDLE_RBAC_DATA_STAGE,
  PermissionAuditInfo,
  PermissionEvents,
  RBAC_BACKEND,
  RoleAuditInfo,
  RoleEvents,
} from '../audit-log/audit-logger';
import { ConditionalStorage } from '../database/conditional-storage';
import {
  RoleMetadataDao,
  RoleMetadataStorage,
} from '../database/role-metadata';
import { CSVFileWatcher } from '../file-permissions/csv-file-watcher';
import { metadataStringToPolicy, removeTheDifference } from '../helper';
import { validateEntityReference } from '../validation/policies-validation';
import { EnforcerDelegate } from './enforcer-delegate';

export const ADMIN_ROLE_NAME = 'role:default/rbac_admin';
export const ADMIN_ROLE_AUTHOR = 'application configuration';
const DEF_ADMIN_ROLE_DESCRIPTION =
  'The default permission policy for the admin role allows for the creation, deletion, updating, and reading of roles and permission policies.';

const getAdminRoleMetadata = (): RoleMetadataDao => {
  const currentDate: Date = new Date();
  return {
    source: 'configuration',
    roleEntityRef: ADMIN_ROLE_NAME,
    description: DEF_ADMIN_ROLE_DESCRIPTION,
    author: ADMIN_ROLE_AUTHOR,
    modifiedBy: ADMIN_ROLE_AUTHOR,
    lastModified: currentDate.toUTCString(),
    createdAt: currentDate.toUTCString(),
  };
};

const useAdminsFromConfig = async (
  admins: Config[],
  enf: EnforcerDelegate,
  auditLogger: AuditLogger,
  roleMetadataStorage: RoleMetadataStorage,
  knex: Knex,
) => {
  const groupPoliciesToCompare: string[] = [];
  const addedGroupPolicies = new Map<string, string>();

  for (const admin of admins) {
    const entityRef = admin.getString('name');
    validateEntityReference(entityRef);

    addedGroupPolicies.set(entityRef, ADMIN_ROLE_NAME);
  }

  const adminRoleMeta =
    await roleMetadataStorage.findRoleMetadata(ADMIN_ROLE_NAME);

  const trx = await knex.transaction();
  try {
    if (!adminRoleMeta) {
      // even if there are no user, we still create default role metadata for admins
      await roleMetadataStorage.createRoleMetadata(getAdminRoleMetadata(), trx);
    } else if (adminRoleMeta.source === 'legacy') {
      await roleMetadataStorage.updateRoleMetadata(
        getAdminRoleMetadata(),
        ADMIN_ROLE_NAME,
        trx,
      );
    }
    await trx.commit();
  } catch (error) {
    await trx.rollback(error);
    throw error;
  }

  const addedRoleMembers = Array.from<string[]>(addedGroupPolicies.entries());
  await enf.addOrUpdateGroupingPolicies(
    addedRoleMembers,
    getAdminRoleMetadata(),
  );

  await auditLogger.auditLog<RoleAuditInfo>({
    actorId: RBAC_BACKEND,
    message: `Created or updated role`,
    eventName: RoleEvents.CREATE_OR_UPDATE_ROLE,
    metadata: {
      ...getAdminRoleMetadata(),
      members: addedRoleMembers.map(gp => gp[0]),
    },
    stage: HANDLE_RBAC_DATA_STAGE,
    status: 'succeeded',
  });

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
    ADMIN_ROLE_NAME,
    enf,
    auditLogger,
    ADMIN_ROLE_AUTHOR,
  );
};

const addAdminPermission = async (
  policy: string[],
  enf: EnforcerDelegate,
  auditLogger: AuditLogger,
) => {
  await enf.addOrUpdatePolicy(policy, 'configuration');

  await auditLogger.auditLog<PermissionAuditInfo>({
    actorId: RBAC_BACKEND,
    message: `Created or updated policy`,
    eventName: PermissionEvents.CREATE_OR_UPDATE_POLICY,
    metadata: { policies: [policy], source: 'configuration' },
    stage: HANDLE_RBAC_DATA_STAGE,
    status: 'succeeded',
  });
};

const setAdminPermissions = async (
  enf: EnforcerDelegate,
  auditLogger: AuditLogger,
) => {
  await addAdminPermission(
    [ADMIN_ROLE_NAME, 'policy-entity', 'read', 'allow'],
    enf,
    auditLogger,
  );
  await addAdminPermission(
    [ADMIN_ROLE_NAME, 'policy-entity', 'create', 'allow'],
    enf,
    auditLogger,
  );
  await addAdminPermission(
    [ADMIN_ROLE_NAME, 'policy-entity', 'delete', 'allow'],
    enf,
    auditLogger,
  );
  await addAdminPermission(
    [ADMIN_ROLE_NAME, 'policy-entity', 'update', 'allow'],
    enf,
    auditLogger,
  );
  // needed for rbac frontend.
  await addAdminPermission(
    [ADMIN_ROLE_NAME, 'catalog-entity', 'read', 'allow'],
    enf,
    auditLogger,
  );
};

const evaluatePermMsg = (
  userEntityRef: string | undefined,
  result: AuthorizeResult,
  permission: Permission,
) =>
  `${userEntityRef} is ${result} for permission '${permission.name}'${
    isResourcePermission(permission)
      ? `, resource type '${permission.resourceType}'`
      : ''
  } and action '${toPermissionAction(permission.attributes)}'`;

export class RBACPermissionPolicy implements PermissionPolicy {
  private readonly enforcer: EnforcerDelegate;
  private readonly auditLogger: AuditLogger;
  private readonly conditionStorage: ConditionalStorage;
  private readonly superUserList?: string[];

  public static async build(
    logger: LoggerService,
    auditLogger: AuditLogger,
    configApi: ConfigApi,
    conditionalStorage: ConditionalStorage,
    enforcerDelegate: EnforcerDelegate,
    roleMetadataStorage: RoleMetadataStorage,
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

    const allowReload =
      configApi.getOptionalBoolean('permission.rbac.policyFileReload') || false;

    if (superUsers && superUsers.length > 0) {
      for (const user of superUsers) {
        const userName = user.getString('name');
        superUserList.push(userName);
      }
    }

    await useAdminsFromConfig(
      adminUsers || [],
      enforcerDelegate,
      auditLogger,
      roleMetadataStorage,
      knex,
    );
    await setAdminPermissions(enforcerDelegate, auditLogger);

    if (
      (!adminUsers || adminUsers.length === 0) &&
      (!superUsers || superUsers.length === 0)
    ) {
      logger.warn(
        'There are no admins or super admins configured for the RBAC-backend plugin.',
      );
    }

    const csvFile = new CSVFileWatcher(
      enforcerDelegate,
      logger,
      roleMetadataStorage,
      auditLogger,
    );
    await csvFile.initialize(policiesFile, allowReload);

    return new RBACPermissionPolicy(
      enforcerDelegate,
      auditLogger,
      conditionalStorage,
      superUserList,
    );
  }

  private constructor(
    enforcer: EnforcerDelegate,
    auditLogger: AuditLogger,
    conditionStorage: ConditionalStorage,
    superUserList?: string[],
  ) {
    this.enforcer = enforcer;
    this.auditLogger = auditLogger;
    this.conditionStorage = conditionStorage;
    this.superUserList = superUserList;
  }

  async handle(
    request: PolicyQuery,
    identityResp?: BackstageIdentityResponse | undefined,
  ): Promise<PolicyDecision> {
    const userEntityRef =
      identityResp?.identity.userEntityRef ?? `user without entity`;

    let auditOptions = createPermissionEvaluationOptions(
      `Policy check for ${userEntityRef}`,
      userEntityRef,
      request,
    );
    this.auditLogger.auditLog(auditOptions);

    try {
      let status = false;

      const action = toPermissionAction(request.permission.attributes);
      if (!identityResp) {
        const msg = evaluatePermMsg(
          userEntityRef,
          AuthorizeResult.DENY,
          request.permission,
        );
        auditOptions = createPermissionEvaluationOptions(
          msg,
          userEntityRef,
          request,
          { result: AuthorizeResult.DENY },
        );
        await this.auditLogger.auditLog(auditOptions);
        return { result: AuthorizeResult.DENY };
      }

      const permissionName = request.permission.name;
      const roles = await this.enforcer.getRolesForUser(userEntityRef);

      if (isResourcePermission(request.permission)) {
        const resourceType = request.permission.resourceType;

        // handle conditions if they are present
        if (identityResp) {
          const conditionResult = await this.handleConditions(
            userEntityRef,
            request,
            roles,
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

        status = await this.isAuthorized(userEntityRef, obj, action, roles);
      } else {
        // handle permission with 'basic' type
        status = await this.isAuthorized(
          userEntityRef,
          permissionName,
          action,
          roles,
        );
      }

      const result = status ? AuthorizeResult.ALLOW : AuthorizeResult.DENY;

      const msg = evaluatePermMsg(userEntityRef, result, request.permission);
      auditOptions = createPermissionEvaluationOptions(
        msg,
        userEntityRef,
        request,
        { result },
      );
      await this.auditLogger.auditLog(auditOptions);
      return { result };
    } catch (error) {
      await this.auditLogger.auditLog({
        message: 'Permission policy check failed',
        eventName: EvaluationEvents.PERMISSION_EVALUATION_FAILED,
        stage: EVALUATE_PERMISSION_ACCESS_STAGE,
        status: 'failed',
        errors: [error],
      });
      return { result: AuthorizeResult.DENY };
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
    roles: string[],
  ): Promise<boolean> => {
    if (this.superUserList!.includes(userIdentity)) {
      return true;
    }

    return await this.enforcer.enforce(userIdentity, permission, action, roles);
  };

  private async handleConditions(
    userEntityRef: string,
    request: PolicyQuery,
    roles: string[],
  ): Promise<PolicyDecision | undefined> {
    const permissionName = request.permission.name;
    const resourceType = (request.permission as ResourcePermission)
      .resourceType;
    const action = toPermissionAction(request.permission.attributes);

    const conditions: PermissionCriteria<
      PermissionCondition<string, PermissionRuleParams>
    >[] = [];
    let pluginId = '';
    for (const role of roles) {
      const conditionalDecisions = await this.conditionStorage.filterConditions(
        role,
        undefined,
        resourceType,
        [action],
        [permissionName],
      );

      if (conditionalDecisions.length === 1) {
        pluginId = conditionalDecisions[0].pluginId;
        conditions.push(conditionalDecisions[0].conditions);
      }

      // this error is unexpected and should not happen, but just in case handle it.
      if (conditionalDecisions.length > 1) {
        const msg = `Detected ${JSON.stringify(
          conditionalDecisions,
        )} collisions for conditional policies. Expected to find a stored single condition for permission with name ${permissionName}, resource type ${resourceType}, action ${action} for user ${userEntityRef}`;
        const auditOptions = createPermissionEvaluationOptions(
          msg,
          userEntityRef,
          request,
          { result: AuthorizeResult.DENY },
        );
        await this.auditLogger.auditLog(auditOptions);
        return {
          result: AuthorizeResult.DENY,
        };
      }
    }

    if (conditions.length > 0) {
      const result: ConditionalPolicyDecision = {
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
      const msg = `Send condition to plugin with id ${pluginId} to evaluate permission ${permissionName} with resource type ${resourceType} and action ${action} for user ${userEntityRef}`;
      const auditOptions = createPermissionEvaluationOptions(
        msg,
        userEntityRef,
        request,
        result,
      );
      await this.auditLogger.auditLog(auditOptions);
      return result;
    }
    return undefined;
  }
}

import {
  AuthorizeResult,
  PolicyDecision,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';

import { AuditLogOptions } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionAction,
  PermissionInfo,
  RoleConditionalPolicyDecision,
  Source,
  toPermissionAction,
} from '@janus-idp/backstage-plugin-rbac-common';

import { RoleMetadataDao } from '../database/role-metadata';

export type Operation = 'CREATE' | 'CREATE_OR_UPDATE' | 'UPDATE' | 'DELETE';

export const RoleEvents = {
  CREATE_ROLE: 'CreateRole',
  UPDATE_ROLE: 'UpdateRole',
  DELETE_ROLE: 'DeleteRole',
  CREATE_OR_UPDATE_ROLE: 'CreateOrUpdateRole',

  CREATE_OR_UPDATE_ROLE_ERROR: 'CreateOrUpdateRoleError',
  DELETE_OR_UPDATE_ROLE_ERROR: 'DeleteOrUpdateRoleError',
  CREATE_ROLE_ERROR: 'CreateRoleError',
  UPDATE_ROLE_ERROR: 'UpdateRoleError',
  DELETE_ROLE_ERROR: 'DeleteRoleError',
} as const;

export const PermissionEvents = {
  CREATE_POLICY: 'CreatePolicy',
  CREATE_OR_UPDATE_POLICY: 'CreateOrUpdatePolicy',
  UPDATE_POLICY: 'UpdatePolicy',
  DELETE_POLICY: 'DeletePolicy',

  CREATE_POLICY_ERROR: 'CreatePolicyError',
  CREATE_OR_UPDATE_POLICY_ERROR: `CreateOrUpdatePolicyError`,
  UPDATE_POLICY_ERROR: 'UpdatePolicyError',
  DELETE_POLICY_ERROR: 'DeletePolicyError',
} as const;

export type RoleAuditInfo = {
  roleEntityRef: string;
  description?: string;
  source: Source;

  members: string[];

  operation: Operation;
};

export type PermissionAuditInfo = {
  policies: string[][];
  source: Source;
  operation: Operation;
};

export const EvaluationEvents = {
  PERMISSION_EVALUATION_STARTED: 'PermissionEvaluationStarted',
  PERMISSION_EVALUATION_COMPLETED: 'PermissionEvaluationCompleted',
  CONDITION_EVALUATION_COMPLETED: 'ConditionEvaluationCompleted',
  PERMISSION_EVALUATION_FAILED: 'PermissionEvaluationFailed',
} as const;

export type EvaluationAuditInfo = {
  userEntityRef: string;
  permissionName: string;
  action: PermissionAction;
  resourceType?: string;
  decision?: PolicyDecision;
};

export const ConditionEvents = {
  CREATE_CONDITION: 'CreateCondition',
  UPDATE_CONDITION: 'UpdateCondition',
  DELETE_CONDITION: 'DeleteCondition',

  CREATE_CONDITION_ERROR: 'CreateConditionError',
  UPDATE_CONDITION_ERROR: 'UpdateConditionError',
  DELETE_CONDITION_ERROR: 'DeleteConditionError',
};

export type ConditionAuditInfo = {
  roleEntityRef: string;
  condition: RoleConditionalPolicyDecision<PermissionInfo>;
  source: Source;
};

// Audit log stage for processing Role-Based Access Control (RBAC) data
export const HANDLE_RBAC_DATA_STAGE = 'handleRBACData';

// Audit log stage for determining access rights based on user permissions and resource information
export const EVALUATE_PERMISSION_ACCESS_STAGE = 'evaluatePermissionAccess';

// Audit log stage for sending the response to the client about handled permission policies, roles, and condition policies
export const SEND_RESPONSE_STAGE = 'sendResponse';

export function createAuditRoleOptions(
  operation: Operation,
  metadata: RoleMetadataDao,
  members: string[],
  oldRoleMetadata?: RoleMetadataDao,
): AuditLogOptions {
  let message: string;
  let eventName: string;

  switch (operation) {
    case 'CREATE':
      message = `Created '${metadata.roleEntityRef}'`;
      eventName = RoleEvents.CREATE_ROLE;
      break;
    case 'UPDATE':
    case 'CREATE_OR_UPDATE':
      eventName =
        operation === 'UPDATE'
          ? RoleEvents.UPDATE_ROLE
          : RoleEvents.CREATE_OR_UPDATE_ROLE;

      message = `Updated '${
        oldRoleMetadata?.roleEntityRef ?? metadata.roleEntityRef
      }'`;
      if (metadata.roleEntityRef !== oldRoleMetadata?.roleEntityRef) {
        message = `${message}. Role entity reference renamed to ${metadata.roleEntityRef}`;
      }
      break;
    case 'DELETE':
      message = `Deleted '${metadata.roleEntityRef}'`;
      eventName = RoleEvents.DELETE_ROLE;
      break;
    default:
      throw new Error(`Unexpected audit log operation: ${operation}`);
  }

  const auditInfo: RoleAuditInfo = {
    roleEntityRef: metadata.roleEntityRef,
    operation,
    source: metadata.source,
    description: metadata.description ?? oldRoleMetadata?.description ?? '',
    members,
  };

  return {
    message,
    eventName,
    stage: HANDLE_RBAC_DATA_STAGE,
    metadata: auditInfo,
    actorId: metadata.modifiedBy || metadata.author,
  };
}

export function createAuditPermissionOptions(
  policies: string[][],
  operation: Operation,
  source: Source,
  modifiedBy: string,
): AuditLogOptions {
  let eventName;
  switch (operation) {
    case 'CREATE':
      eventName = PermissionEvents.CREATE_POLICY;
      break;
    case 'CREATE_OR_UPDATE':
      eventName = PermissionEvents.CREATE_OR_UPDATE_POLICY;
      break;
    case 'UPDATE':
      eventName = PermissionEvents.UPDATE_POLICY;
      break;
    case 'DELETE':
      eventName = PermissionEvents.DELETE_POLICY;
      break;
    default:
      throw new Error(`Unexpected audit log operation: ${operation}`);
  }

  const message = `Completed permission policies operation "${operation}"`;

  const auditInfo: PermissionAuditInfo = {
    operation,
    source,
    policies,
  };

  return {
    message,
    eventName,
    stage: HANDLE_RBAC_DATA_STAGE,
    metadata: auditInfo,
    actorId: modifiedBy,
  };
}

export function createPermissionEvaluationOptions(
  message: string,
  userEntityRef: string,
  request: PolicyQuery,
  policyDecision?: PolicyDecision,
): AuditLogOptions {
  const auditInfo: EvaluationAuditInfo = {
    userEntityRef,
    permissionName: request.permission.name,
    action: toPermissionAction(request.permission.attributes),
  };

  const resourceType = (request.permission as ResourcePermission).resourceType;
  if (resourceType) {
    auditInfo.resourceType = resourceType;
  }

  let eventName;
  if (!policyDecision) {
    eventName = EvaluationEvents.PERMISSION_EVALUATION_STARTED;
  } else {
    auditInfo.decision = policyDecision;

    switch (policyDecision.result) {
      case AuthorizeResult.DENY:
      case AuthorizeResult.ALLOW:
        eventName = EvaluationEvents.PERMISSION_EVALUATION_COMPLETED;
        break;
      case AuthorizeResult.CONDITIONAL:
        eventName = EvaluationEvents.CONDITION_EVALUATION_COMPLETED;
        break;
      default:
        throw new Error('Unknown policy decision result');
    }
  }

  return {
    message,
    eventName,
    stage: EVALUATE_PERMISSION_ACCESS_STAGE,
    metadata: auditInfo,
    actorId: userEntityRef,
  };
}

export function createAuditConditionOptions(
  condition: RoleConditionalPolicyDecision<PermissionInfo>,
  operation: Operation,
  modifiedBy: string,
): AuditLogOptions {
  let message;
  let eventName;
  switch (operation) {
    case 'CREATE':
      message = `Created condition for role '${condition.roleEntityRef}'`;
      eventName = ConditionEvents.CREATE_CONDITION;
      break;
    case 'UPDATE':
      message = `Updated condition for role '${condition.roleEntityRef}'`;
      eventName = ConditionEvents.UPDATE_CONDITION;
      break;
    case 'DELETE':
      message = `Deleted condition for role '${condition.roleEntityRef}'`;
      eventName = ConditionEvents.DELETE_CONDITION;
      break;
    default:
      throw new Error('Unknown policy decision result');
  }

  const conditionInfo: ConditionAuditInfo = {
    roleEntityRef: condition.roleEntityRef,
    source: 'rest',
    condition,
  };

  return {
    message,
    eventName,
    stage: HANDLE_RBAC_DATA_STAGE,
    metadata: conditionInfo,
    actorId: modifiedBy,
  };
}

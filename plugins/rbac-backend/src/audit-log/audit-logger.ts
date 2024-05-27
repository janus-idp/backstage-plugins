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
import { policyToString, stringToPolicy } from '../helper';

export type Operation = 'CREATE' | 'UPDATE' | 'DELETE';

export const RoleEvents = {
  CREATE_ROLE: 'CreateRole',
  UPDATE_ROLE: 'UpdateRole',
  DELETE_ROLE: 'DeleteRole',

  CREATE_OR_UPDATE_ROLE_ERROR: 'CreateOrUpdateRoleError',
  DELETE_OR_UPDATE_ROLE_ERROR: 'DeleteOrUpdateRoleError',
  UPDATE_ROLE_ERROR: 'UpdateRoleError',
} as const;

export type RoleMembersDiff = {
  added?: string[];
  removed?: string[];
  updated?: string[];
};

export const PermissionEvents = {
  CREATE_POLICY: 'CreatePolicy',
  UPDATE_POLICY: 'UpdatePolicy',
  DELETE_POLICY: 'DeletePolicy',

  CREATE_POLICY_ERROR: 'CreatePolicyError',
  CREATE_OR_UPDATE_POLICY_ERROR: `CreateOrUpdatePolicyError`,
  UPDATE_POLICY_ERROR: 'UpdatePolicyError',
  DELETE_POLICY_ERROR: 'DeletePolicyError',
} as const;

export type PermissionDiff = {
  added?: string[][];
  removed?: string[][];
  updated?: string[][];
};

export type RoleAuditInfo = {
  roleEntityRef: string;
  description?: string;
  source: Source;

  oldRoleEntityRef?: string;
  oldDescription?: string;
  oldSource?: string;

  membersDiff: RoleMembersDiff;
  operation: Operation;
};

export type PermissionAuditInfo = {
  policies: string[][];
  permissionDiff: PermissionDiff;
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
  membersDiff: RoleMembersDiff,
  oldRoleMetadata?: RoleMetadataDao,
): AuditLogOptions {
  let message: string;
  let eventName: string;

  let oldRoleEntityRef: string | undefined;
  let oldDescription: string | undefined;
  let oldSource: Source | undefined;
  switch (operation) {
    case 'CREATE':
      message = `Created '${metadata.roleEntityRef}'`;
      eventName = RoleEvents.CREATE_ROLE;
      break;
    case 'UPDATE':
      if (!oldRoleMetadata) {
        throw new Error(
          `oldRoleMetadata must be specified for operation 'UPDATE'`,
        );
      }
      message = `Updated '${oldRoleMetadata.roleEntityRef}'`;
      eventName = RoleEvents.UPDATE_ROLE;
      if (metadata.roleEntityRef !== oldRoleMetadata.roleEntityRef) {
        message = `${message}. Role entity reference renamed`;
        oldRoleEntityRef = oldRoleMetadata.roleEntityRef;
      }
      if (
        metadata.description &&
        metadata.description !== oldRoleMetadata.description
      ) {
        oldDescription = oldRoleMetadata.description;
      }
      if (metadata.source !== oldRoleMetadata.source) {
        oldSource = oldRoleMetadata.source;
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
    membersDiff,
  };

  if (oldRoleEntityRef) {
    auditInfo.oldRoleEntityRef = oldRoleEntityRef;
  }
  if (oldDescription) {
    auditInfo.oldDescription = oldDescription;
  }
  if (oldSource) {
    auditInfo.oldSource = oldSource;
  }

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
  diff: PermissionDiff,
): AuditLogOptions {
  let eventName;
  switch (operation) {
    case 'CREATE':
      eventName = PermissionEvents.CREATE_POLICY;
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

  const message = `Completed permission policies operation "${operation.toString()}"`;

  const auditInfo: PermissionAuditInfo = {
    operation,
    source,
    policies,
    permissionDiff: diff,
  };

  return {
    message,
    eventName,
    stage: HANDLE_RBAC_DATA_STAGE,
    metadata: auditInfo,
    actorId: modifiedBy,
  };
}

export function getMembersDiff(
  oldRole: string[][],
  newRole: string[][],
  oldSource: Source,
  newSource: Source,
): RoleMembersDiff {
  const oldRoleMembers = oldRole.map(gp => gp[0]);
  const newRoleMembers = newRole.map(gp => gp[0]);

  let updated: string[] = [];
  if (oldRole[0][1] !== newRole[0][1] || oldSource !== newSource) {
    // role was renamed or source was changed
    updated = oldRole
      .map(gp => gp[0])
      .filter(item => newRoleMembers.includes(item));
  }

  const removed = oldRoleMembers.filter(item => !newRoleMembers.includes(item));
  const added = newRoleMembers.filter(item => !oldRoleMembers.includes(item));

  const memberDiff: RoleMembersDiff = {};
  if (added.length > 0) {
    memberDiff.added = added;
  }
  if (removed.length > 0) {
    memberDiff.removed = removed;
  }
  if (updated.length > 0) {
    memberDiff.updated = updated;
  }
  return memberDiff;
}

export function getPoliciesDiff(
  oldPolicies: string[][],
  newPolicies: string[][],
): PermissionDiff {
  const oldPoliciesStringified = oldPolicies.map(p => policyToString(p));
  const newPoliciesStringified = newPolicies.map(p => policyToString(p));

  let updated: string[] = [];

  updated = oldPolicies
    .map(gp => gp[0])
    .filter(item => newPoliciesStringified.includes(item));

  const removed = oldPoliciesStringified.filter(
    item => !newPoliciesStringified.includes(item),
  );
  const added = newPoliciesStringified.filter(
    item => !oldPoliciesStringified.includes(item),
  );

  const policiesDiff: PermissionDiff = {};
  if (added.length > 0) {
    policiesDiff.added = added.map(sp => stringToPolicy(sp));
  }
  if (removed.length > 0) {
    policiesDiff.removed = removed.map(sp => stringToPolicy(sp));
  }
  if (updated.length > 0) {
    policiesDiff.updated = updated.map(sp => stringToPolicy(sp));
  }
  return policiesDiff;
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

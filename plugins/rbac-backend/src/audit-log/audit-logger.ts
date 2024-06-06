import {
  AuthorizeResult,
  PolicyDecision,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import { PolicyQuery } from '@backstage/plugin-permission-node';

import { AuditLogOptions } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionAction,
  RoleConditionalPolicyDecision,
  Source,
  toPermissionAction,
} from '@janus-idp/backstage-plugin-rbac-common';

export const RoleEvents = {
  CREATE_ROLE: 'CreateRole',
  UPDATE_ROLE: 'UpdateRole',
  DELETE_ROLE: 'DeleteRole',
  CREATE_OR_UPDATE_ROLE: 'CreateOrUpdateRole',
  GET_ROLE: 'GetRole',

  CREATE_ROLE_ERROR: 'CreateRoleError',
  UPDATE_ROLE_ERROR: 'UpdateRoleError',
  DELETE_ROLE_ERROR: 'DeleteRoleError',
  GET_ROLE_ERROR: 'GetRoleError',
} as const;

export const PermissionEvents = {
  CREATE_POLICY: 'CreatePolicy',
  CREATE_OR_UPDATE_POLICY: 'CreateOrUpdatePolicy',
  UPDATE_POLICY: 'UpdatePolicy',
  DELETE_POLICY: 'DeletePolicy',
  GET_POLICY: 'GetPolicy',

  CREATE_POLICY_ERROR: 'CreatePolicyError',
  UPDATE_POLICY_ERROR: 'UpdatePolicyError',
  DELETE_POLICY_ERROR: 'DeletePolicyError',
  GET_POLICY_ERROR: 'GetPolicyError',
} as const;

export type RoleAuditInfo = {
  roleEntityRef: string;
  description?: string;
  source: Source;

  members: string[];
};

export type PermissionAuditInfo = {
  policies: string[][];
  source: Source;
};

export const EvaluationEvents = {
  PERMISSION_EVALUATION_STARTED: 'PermissionEvaluationStarted',
  PERMISSION_EVALUATION_COMPLETED: 'PermissionEvaluationCompleted',
  CONDITION_EVALUATION_COMPLETED: 'ConditionEvaluationCompleted',
  PERMISSION_EVALUATION_FAILED: 'PermissionEvaluationFailed',
} as const;

export const ListPluginPoliciesEvents = {
  GET_PLUGINS_POLICIES: 'GetPluginsPolicies',
  GET_PLUGINS_POLICIES_ERROR: 'GetPluginsPoliciesError',
};

export const ListConditionEvents = {
  GET_CONDITION_RULES: 'GetConditionRules',
  GET_CONDITION_RULES_ERROR: 'GetConditionRulesError',
};

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
  GET_CONDITION: 'GetCondition',

  CREATE_CONDITION_ERROR: 'CreateConditionError',
  UPDATE_CONDITION_ERROR: 'UpdateConditionError',
  DELETE_CONDITION_ERROR: 'DeleteConditionError',
  GET_CONDITION_ERROR: 'GetConditionError',
};

export type ConditionAuditInfo = {
  condition: RoleConditionalPolicyDecision<PermissionAction>;
};

export const RBAC_BACKEND = 'rbac-backend';

// Audit log stage for processing Role-Based Access Control (RBAC) data
export const HANDLE_RBAC_DATA_STAGE = 'handleRBACData';

// Audit log stage for determining access rights based on user permissions and resource information
export const EVALUATE_PERMISSION_ACCESS_STAGE = 'evaluatePermissionAccess';

// Audit log stage for sending the response to the client about handled permission policies, roles, and condition policies
export const SEND_RESPONSE_STAGE = 'sendResponse';
export const RESPONSE_ERROR = 'responseError';

export function createPermissionEvaluationOptions(
  message: string,
  userEntityRef: string,
  request: PolicyQuery,
  policyDecision?: PolicyDecision,
): AuditLogOptions<EvaluationAuditInfo> {
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
    actorId: userEntityRef,
    message,
    eventName,
    metadata: auditInfo,
    stage: EVALUATE_PERMISSION_ACCESS_STAGE,
    status: 'succeeded',
  };
}

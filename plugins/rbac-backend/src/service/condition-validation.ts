import {
  PermissionCondition,
  PermissionCriteria,
  PermissionRuleParams,
} from '@backstage/plugin-permission-common';

import { RoleConditionalPolicyDecision } from '@janus-idp/backstage-plugin-rbac-common';

export function validateRoleCondition(
  condition: RoleConditionalPolicyDecision,
) {
  if (!condition.roleEntityRef) {
    throw new Error(`'roleEntityRef' must be specified in the role condition`);
  }
  if (!condition.result) {
    throw new Error(`'result' must be specified in the role condition`);
  }
  if (!condition.pluginId) {
    throw new Error(`'pluginId' must be specified in the role condition`);
  }
  if (!condition.resourceType) {
    throw new Error(`'resourceType' must be specified in the role condition`);
  }
  if (!condition.conditions) {
    throw new Error(`'conditions' must be specified in the role condition`);
  }
  if (condition.conditions) {
    validatePermissionCondition(
      condition.conditions,
      'roleCondition.conditions',
    );
  }
  console.log('ok');
}

function validatePermissionCondition(
  conditionOrCriteria: PermissionCriteria<
    PermissionCondition<string, PermissionRuleParams>
  >,
  jsonPathLocator: string,
) {
  if ('not' in conditionOrCriteria) {
    validatePermissionCondition(
      conditionOrCriteria.not,
      `${jsonPathLocator}.not`,
    );
    return;
  }
  if ('allOf' in conditionOrCriteria) {
    if (
      !Array.isArray(conditionOrCriteria.allOf) ||
      conditionOrCriteria.allOf.length === 0
    ) {
      throw new Error(
        `${jsonPathLocator}.allOf criteria must be non empty array`,
      );
    }
    for (const [index, elem] of conditionOrCriteria.allOf.entries()) {
      validatePermissionCondition(elem, `${jsonPathLocator}.allOf[${index}]`);
    }
    return;
  }
  if ('anyOf' in conditionOrCriteria) {
    if (
      !Array.isArray(conditionOrCriteria.anyOf) ||
      conditionOrCriteria.anyOf.length === 0
    ) {
      throw new Error(
        `${jsonPathLocator}.anyOf criteria must be non empty array`,
      );
    }
    for (const [index, elem] of conditionOrCriteria.anyOf.entries()) {
      validatePermissionCondition(elem, `${jsonPathLocator}.anyOf[${index}]`);
    }
    return;
  }
  if (!('resourceType' in conditionOrCriteria)) {
    throw new Error(
      `'resourceType' must be specified in the ${jsonPathLocator}.condition`,
    );
  }
  if (!('rule' in conditionOrCriteria)) {
    throw new Error(
      `'rule' must be specified in the ${jsonPathLocator}.condition`,
    );
  }
}

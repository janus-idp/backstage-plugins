import {
  difference,
  isEqual,
  omitBy,
  sortBy,
  toPairs,
  ValueKeyIteratee,
} from 'lodash';

import {
  PermissionAction,
  RoleBasedPolicy,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import { EnforcerDelegate } from './service/enforcer-delegate';

export function policyToString(policy: string[]): string {
  return `[${policy.join(', ')}]`;
}

export function policiesToString(policies: string[][]): string {
  const policiesString = policies
    .map(policy => policyToString(policy))
    .join(',');
  return `[${policiesString}]`;
}

export function metadataStringToPolicy(policy: string): string[] {
  return policy.replace('[', '').replace(']', '').split(', ');
}

export async function removeTheDifference(
  originalGroup: string[],
  addedGroup: string[],
  source: Source,
  roleEntityRef: string,
  enf: EnforcerDelegate,
  modifiedBy: string,
): Promise<void> {
  originalGroup.sort((a, b) => a.localeCompare(b));
  addedGroup.sort((a, b) => a.localeCompare(b));
  const missing = difference(originalGroup, addedGroup);

  for (const missingRole of missing) {
    const role = [missingRole, roleEntityRef];
    await enf.removeGroupingPolicy(
      role,
      { source, modifiedBy, roleEntityRef },
      false,
    );
  }
}

export function transformArrayToPolicy(policyArray: string[]): RoleBasedPolicy {
  const [entityReference, permission, policy, effect] = policyArray;
  return { entityReference, permission, policy, effect };
}

export function deepSortedEqual(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
  excludeFields?: string[],
): boolean {
  let copyObj1;
  let copyObj2;
  if (excludeFields) {
    const excludeFieldsPredicate: ValueKeyIteratee<any> = (_value, key) => {
      for (const field of excludeFields) {
        if (key === field) {
          return true;
        }
      }
      return false;
    };
    copyObj1 = omitBy(obj1, excludeFieldsPredicate);
    copyObj2 = omitBy(obj2, excludeFieldsPredicate);
  }

  const sortedObj1 = sortBy(toPairs(copyObj1 || obj1), ([key]) => key);
  const sortedObj2 = sortBy(toPairs(copyObj2 || obj2), ([key]) => key);

  return isEqual(sortedObj1, sortedObj2);
}

export function isPermissionAction(action: string): action is PermissionAction {
  return ['create', 'read', 'update', 'delete', 'use'].includes(
    action as PermissionAction,
  );
}

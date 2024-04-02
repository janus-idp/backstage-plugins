import { difference, isEqual, sortBy, toPairs } from 'lodash';

import {
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
  roleName: string,
  enf: EnforcerDelegate,
): Promise<void> {
  originalGroup.sort((a, b) => a.localeCompare(b));
  addedGroup.sort((a, b) => a.localeCompare(b));
  const missing = difference(originalGroup, addedGroup);

  for (const missingRole of missing) {
    const role = [missingRole, roleName];
    await enf.removeGroupingPolicy(role, source, false);
  }
}

export function transformArrayToPolicy(policyArray: string[]): RoleBasedPolicy {
  const [entityReference, permission, policy, effect] = policyArray;
  return { entityReference, permission, policy, effect };
}

export function deepSortedEqual(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): boolean {
  const sortedObj1 = sortBy(toPairs(obj1), ([key]) => key);
  const sortedObj2 = sortBy(toPairs(obj2), ([key]) => key);

  return isEqual(sortedObj1, sortedObj2);
}

import { difference } from 'lodash';

import { Source } from '@janus-idp/backstage-plugin-rbac-common';

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
  const missing = difference(originalGroup.sort(), addedGroup.sort());

  missing.forEach(async name => {
    const role = [name, roleName];
    await enf.removeGroupingPolicy(role, source, true);
  });
}

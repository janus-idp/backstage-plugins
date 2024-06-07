import {
  difference,
  isEqual,
  omitBy,
  sortBy,
  toPairs,
  ValueKeyIteratee,
} from 'lodash';

import { AuditLogger } from '@janus-idp/backstage-plugin-audit-log-node';
import {
  PermissionAction,
  RoleBasedPolicy,
  Source,
} from '@janus-idp/backstage-plugin-rbac-common';

import {
  HANDLE_RBAC_DATA_STAGE,
  RBAC_BACKEND,
  RoleAuditInfo,
  RoleEvents,
} from './audit-log/audit-logger';
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
  auditLogger: AuditLogger,
  modifiedBy: string,
): Promise<void> {
  originalGroup.sort((a, b) => a.localeCompare(b));
  addedGroup.sort((a, b) => a.localeCompare(b));
  const missing = difference(originalGroup, addedGroup);

  const groupPolicies: string[][] = [];
  for (const missingRole of missing) {
    groupPolicies.push([missingRole, roleEntityRef]);
  }

  if (groupPolicies.length === 0) {
    return;
  }

  const roleMetadata = { source, modifiedBy, roleEntityRef };
  await enf.removeGroupingPolicies(groupPolicies, roleMetadata, false);

  const remainingMembers = await enf.getFilteredGroupingPolicy(
    1,
    roleEntityRef,
  );
  const message =
    remainingMembers.length > 0
      ? 'Updated role: deleted members'
      : 'Deleted role';
  const eventName =
    remainingMembers.length > 0
      ? RoleEvents.UPDATE_ROLE
      : RoleEvents.DELETE_ROLE;
  await auditLogger.auditLog<RoleAuditInfo>({
    actorId: RBAC_BACKEND,
    message,
    eventName,
    metadata: {
      ...roleMetadata,
      members: groupPolicies.map(gp => gp[0]),
    },
    stage: HANDLE_RBAC_DATA_STAGE,
    status: 'succeeded',
  });
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

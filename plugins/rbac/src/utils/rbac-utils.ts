import { isUserEntity, parseEntityRef } from '@backstage/catalog-model';

import { RoleBasedPolicy } from '@janus-idp/backstage-plugin-rbac-common';

export const getPermissions = (
  role: string,
  policies: RoleBasedPolicy[],
): number => {
  if (!policies || policies?.length === 0) {
    return 0;
  }
  return policies.filter(
    (policy: RoleBasedPolicy) => policy.entityReference === role,
  ).length;
};

export const getMembers = (memberReferences: string[]): string => {
  if (!memberReferences || memberReferences.length === 0) {
    return 'No members';
  }

  const res = memberReferences.reduce(
    (acc, member) => {
      const entity = parseEntityRef(member) as any;
      if (isUserEntity(entity)) {
        acc.users++;
      } else {
        acc.groups++;
      }
      return acc;
    },
    { users: 0, groups: 0 },
  );

  let members = '';
  if (res.users > 0) {
    members = `${res.users} ${res.users > 1 ? 'Users' : 'User'}`;
  }
  if (res.groups > 0) {
    members = members.concat(
      members.length > 0 ? ', ' : '',
      `${res.groups} ${res.groups > 1 ? 'Groups' : 'Group'}`,
    );
  }
  return members;
};

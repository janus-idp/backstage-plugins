import {
  GroupEntity,
  isUserEntity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';

import {
  PermissionPolicy,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';

import { SelectedMember } from '../components/CreateRole/types';
import { MemberEntity, MembersData, PermissionsData } from '../types';
import { getMembersCount } from './create-role-utils';

export const getPermissions = (
  role: string,
  policies: RoleBasedPolicy[],
): number => {
  if (!policies || policies?.length === 0 || !Array.isArray(policies)) {
    return 0;
  }
  return policies.filter(
    (policy: RoleBasedPolicy) =>
      policy.entityReference === role && policy.effect !== 'deny',
  ).length;
};

export const getMembersString = (res: {
  users: number;
  groups: number;
}): string => {
  let membersString = '';
  if (res.users > 0) {
    membersString = `${res.users} ${res.users > 1 ? 'users' : 'user'}`;
  }
  if (res.groups > 0) {
    membersString = membersString.concat(
      membersString.length > 0 ? ', ' : '',
      `${res.groups} ${res.groups > 1 ? 'groups' : 'group'}`,
    );
  }
  return membersString;
};

export const getMembers = (
  members: (string | MembersData | SelectedMember)[],
): string => {
  if (!members || members.length === 0) {
    return 'No members';
  }

  const res = members.reduce(
    (acc, member) => {
      if (typeof member === 'object') {
        if (member.type === 'User' || member.type === 'user') {
          acc.users++;
        } else {
          acc.groups++;
        }
      } else {
        const entity = parseEntityRef(member) as any;
        if (isUserEntity(entity)) {
          acc.users++;
        } else {
          acc.groups++;
        }
      }
      return acc;
    },
    { users: 0, groups: 0 },
  );

  return getMembersString(res);
};

export const getMembersFromGroup = (group: GroupEntity): number => {
  const membersList = group.relations?.reduce((acc, relation) => {
    let temp = acc;
    if (relation.type === 'hasMember') {
      temp++;
    }
    return temp;
  }, 0);
  return membersList || 0;
};

export const getPluginId = (
  permissions: PermissionPolicy[],
  permission: string | undefined,
): string =>
  permissions.find(p => p.policies?.find(pol => pol.permission === permission))
    ?.pluginId || '-';

export const getPermissionsData = (
  policies: RoleBasedPolicy[],
  permissionPolicies: PermissionPolicy[],
): PermissionsData[] =>
  policies.reduce((acc: PermissionsData[], policy: RoleBasedPolicy) => {
    if (policy?.effect === 'allow') {
      const permission = acc.find(
        plugin =>
          plugin.permission === policy.permission &&
          !plugin.policies.has({
            policy: policy?.policy || 'use',
            effect: 'allow',
          }),
      );
      if (permission) {
        permission.policyString.add(
          policy.policy ? `, ${policy.policy}` : ', use',
        );
        permission.policies.add({
          policy: policy.policy || 'use',
          effect: policy.effect,
        });
      } else {
        const policyString = new Set<string>();
        const policiesSet = new Set<{ policy: string; effect: string }>();
        acc.push({
          permission: policy.permission || '-',
          plugin: getPluginId(permissionPolicies, policy?.permission) || '-',
          policyString: policyString.add(policy.policy || 'use'),
          policies: policiesSet.add({
            policy: policy.policy || 'use',
            effect: policy.effect,
          }),
        });
      }
    }
    return acc;
  }, []);

export const getKindNamespaceName = (roleRef: string) => {
  const refs: string[] = roleRef.split(':');
  const kind = refs[0];
  const namespace = refs[1].split('/')[0];
  const name = refs[1].split('/')[1];
  return { kind, namespace, name };
};

export const getSelectedMember = (
  memberResource: MemberEntity | undefined,
  ref: string,
): SelectedMember => {
  if (memberResource) {
    return {
      ref: stringifyEntityRef(memberResource),
      label:
        memberResource.spec.profile?.displayName ??
        memberResource.metadata.name,
      etag: memberResource.metadata.etag as string,
      type: memberResource.kind,
      namespace: memberResource.metadata.namespace as string,
      members: getMembersCount(memberResource),
    };
  } else if (ref) {
    const { kind, namespace, name } = getKindNamespaceName(ref);
    return {
      ref,
      label: name,
      etag: `${kind}-${namespace}-${name}`,
      type: kind,
      namespace: namespace,
      members: kind === 'group' ? 0 : undefined,
    };
  }
  return {} as SelectedMember;
};

import {
  GroupEntity,
  isUserEntity,
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';

import {
  PermissionPolicy,
  Policy,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';
import { getTitleCase } from '@janus-idp/shared-react';

import { RowPolicy, SelectedMember } from '../components/CreateRole/types';
import {
  MemberEntity,
  MembersData,
  PermissionsData,
  PermissionsDataSet,
} from '../types';
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

const getPolicy = (str: string) => {
  const arr = str.split('.');
  return arr[arr.length - 1];
};

const getAllPolicies = (
  permission: string,
  allowedPolicies: RowPolicy[],
  policies: Policy[],
) => {
  const deniedPolicies = policies?.reduce((acc, p) => {
    if (
      permission === p.permission &&
      !allowedPolicies.find(
        allowedPolicy =>
          allowedPolicy.policy.toLowerCase() === p.policy?.toLowerCase(),
      )
    ) {
      acc.push({
        policy: getTitleCase(p.policy as string) || 'Use',
        effect: 'deny',
      });
    }
    return acc;
  }, [] as RowPolicy[]);
  return [...(allowedPolicies || []), ...(deniedPolicies || [])];
};

export const getPermissionsData = (
  policies: RoleBasedPolicy[],
  permissionPolicies: PermissionPolicy[],
): PermissionsData[] => {
  const data = policies.reduce(
    (acc: PermissionsDataSet[], policy: RoleBasedPolicy) => {
      if (policy?.effect === 'allow') {
        const policyStr =
          policy?.policy || getPolicy(policy.permission as string);
        const policyTitleCase = getTitleCase(policyStr);
        const permission = acc.find(
          plugin =>
            plugin.permission === policy.permission &&
            !plugin.policies.has({
              policy: policyTitleCase || 'Use',
              effect: 'allow',
            }),
        );
        if (permission) {
          permission.policyString?.add(
            policyTitleCase ? `, ${policyTitleCase}` : ', Use',
          );
          permission.policies.add({
            policy: policyTitleCase || 'Use',
            effect: policy.effect,
          });
        } else {
          const policyString = new Set<string>();
          const policiesSet = new Set<{ policy: string; effect: string }>();
          acc.push({
            permission: policy.permission || '-',
            plugin: getPluginId(permissionPolicies, policy?.permission) || '-',
            policyString: policyString.add(policyTitleCase || 'Use'),
            policies: policiesSet.add({
              policy: policyTitleCase || 'Use',
              effect: policy.effect,
            }),
          });
        }
      }
      return acc;
    },
    [],
  );
  return data.map((p: PermissionsDataSet) => ({
    ...p,
    ...(p.policyString ? { policyString: Array.from(p.policyString) } : {}),
    policies: getAllPolicies(
      p.permission,
      Array.from(p.policies),
      permissionPolicies.find(pp => pp.pluginId === p.plugin)
        ?.policies as Policy[],
    ),
  })) as PermissionsData[];
};

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
      id: memberResource.metadata.etag as string,
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
      id: `${kind}-${namespace}-${name}`,
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

export const isSamePermissionPolicy = (
  a: RoleBasedPolicy,
  b: RoleBasedPolicy,
) =>
  a.entityReference === b.entityReference &&
  a.permission === b.permission &&
  a.policy === b.policy &&
  a.effect === b.effect;

export const onlyInLeft = (
  left: RoleBasedPolicy[],
  right: RoleBasedPolicy[],
  compareFunction: (a: RoleBasedPolicy, b: RoleBasedPolicy) => boolean,
) =>
  left.filter(
    leftValue =>
      !right.some(rightValue => compareFunction(leftValue, rightValue)),
  );

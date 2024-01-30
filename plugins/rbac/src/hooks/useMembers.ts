import React from 'react';
import { useAsyncRetry, useInterval } from 'react-use';

import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import { MemberEntity, MembersData } from '../types';
import { getKindNamespaceName, getMembersFromGroup } from '../utils/rbac-utils';

const getErrorText = (
  role: any,
  members: any,
): { message: string } | undefined => {
  if (!Array.isArray(role) && (role as Response)?.statusText) {
    return {
      message: `Unable to fetch role: ${(role as Response).statusText}`,
    };
  } else if (!Array.isArray(members) && (members as Response)?.statusText) {
    return {
      message: `Unable to fetch members: ${(members as Response).statusText}`,
    };
  }
  return undefined;
};

const getMemberData = (
  memberResource: MemberEntity | undefined,
  ref: string,
) => {
  if (memberResource) {
    return {
      name:
        memberResource.spec.profile?.displayName ??
        memberResource.metadata.name,
      type: memberResource.kind,
      ref: {
        namespace: memberResource.metadata.namespace as string,
        kind: memberResource.kind.toLowerCase(),
        name: memberResource.metadata.name,
      },
      members:
        memberResource.kind === 'Group'
          ? getMembersFromGroup(memberResource)
          : 0,
    };
  }
  const { kind, namespace, name } = getKindNamespaceName(ref);
  return {
    name,
    type: kind === 'user' ? 'User' : ('Group' as 'User' | 'Group'),
    ref: {
      namespace,
      kind,
      name,
    },
    members: 0,
  };
};

export const useMembers = (roleName: string, pollInterval?: number) => {
  const rbacApi = useApi(rbacApiRef);
  let data: MembersData[] = [];
  const {
    value: role,
    retry: roleRetry,
    error: roleError,
  } = useAsyncRetry(async () => {
    return await rbacApi.getRole(roleName);
  });

  const {
    value: members,
    retry: membersRetry,
    error: membersError,
  } = useAsyncRetry(async () => {
    return await rbacApi.getMembers();
  });

  const loading = !roleError && !membersError && !role && !members;

  data = React.useMemo(
    () =>
      Array.isArray(role)
        ? role[0].memberReferences.reduce((acc: MembersData[], ref: string) => {
            const memberResource: MemberEntity | undefined = Array.isArray(
              members,
            )
              ? members.find(member => stringifyEntityRef(member) === ref)
              : undefined;
            const memberData = getMemberData(memberResource, ref);
            acc.push(memberData);
            return acc;
          }, [])
        : [],
    [role, members],
  );

  useInterval(
    () => {
      roleRetry();
      membersRetry();
    },
    loading ? null : pollInterval || 10000,
  );

  return {
    loading,
    data,
    retry: { roleRetry, membersRetry },
    error: getErrorText(role, members) || roleError || membersError,
  };
};

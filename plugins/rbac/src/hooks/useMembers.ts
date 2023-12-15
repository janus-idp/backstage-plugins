import React from 'react';
import { useAsync, useAsyncRetry } from 'react-use';

import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import { MembersData } from '../types';
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

export const useMembers = (roleName: string) => {
  const rbacApi = useApi(rbacApiRef);
  let data: MembersData[] = [];
  const {
    loading: rolesLoading,
    value: role,
    retry,
    error: roleError,
  } = useAsyncRetry(async () => {
    return await rbacApi.getRole(roleName);
  });

  const {
    loading: membersLoading,
    value: members,
    error: membersError,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const loading = rolesLoading && membersLoading;

  data = React.useMemo(
    () =>
      Array.isArray(role)
        ? role[0].memberReferences.reduce((acc: MembersData[], ref: string) => {
            const memberResource =
              Array.isArray(members) &&
              members.find(member => stringifyEntityRef(member) === ref);
            if (memberResource) {
              acc.push({
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
              });
            } else {
              const { kind, namespace, name } = getKindNamespaceName(ref);
              acc.push({
                name,
                type: kind === 'user' ? 'User' : 'Group',
                ref: {
                  namespace,
                  kind,
                  name,
                },
                members: 0,
              });
            }
            return acc;
          }, [])
        : [],
    [role, members],
  );

  return {
    loading,
    data,
    retry,
    error: getErrorText(role, members) || roleError || membersError,
  };
};

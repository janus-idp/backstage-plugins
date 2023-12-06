import React from 'react';
import { useAsync, useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';
import { usePermission } from '@backstage/plugin-permission-react';

import {
  policyEntityDeletePermission,
  Role,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';
import { RolesData } from '../types';
import { getPermissions } from '../utils/rbac-utils';

export const useRoles = (pollInterval?: number) => {
  const rbacApi = useApi(rbacApiRef);
  const {
    loading: rolesLoading,
    value: roles,
    retry,
  } = useAsyncRetry(async () => await rbacApi.getRoles());

  const { loading: policiesLoading, value: policies } = useAsync(
    async () => await rbacApi.getPolicies(),
    [],
  );

  const permissionResult = usePermission({
    permission: policyEntityDeletePermission,
    resourceRef: policyEntityDeletePermission.resourceType,
  });
  const data: RolesData[] = React.useMemo(
    () =>
      roles && roles?.length > 0
        ? roles.reduce((acc: any, role: Role) => {
            const permissions = getPermissions(
              role.name,
              policies as RoleBasedPolicy[],
            );

            return [
              ...acc,
              {
                id: role.name,
                name: role.name,
                description: '-',
                members: role.memberReferences,
                permissions,
                modifiedBy: '-',
                lastModified: '-',
                permissionResult,
              },
            ];
          }, [])
        : [],
    [roles, policies, permissionResult],
  );
  const loading = rolesLoading && policiesLoading;
  useInterval(() => retry(), loading ? null : pollInterval || 5000);

  return { loading, data, retry };
};

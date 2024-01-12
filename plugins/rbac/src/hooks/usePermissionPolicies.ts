import React from 'react';
import { useAsync, useAsyncRetry } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import { getPermissionsData } from '../utils/rbac-utils';

export const usePermissionPolicies = (entityReference: string) => {
  const rbacApi = useApi(rbacApiRef);
  const {
    loading: policiesLoading,
    value: policies,
    retry,
    error,
  } = useAsyncRetry(async () => {
    return await rbacApi.getAssociatedPolicies(entityReference);
  });

  const {
    value: permissionPolicies,
    loading: permissionPoliciesLoading,
    error: permissionPoliciesError,
  } = useAsync(async () => {
    return await rbacApi.listPermissions();
  });

  const loading = policiesLoading || permissionPoliciesLoading;

  const data = React.useMemo(() => {
    const pp = Array.isArray(permissionPolicies) ? permissionPolicies : [];
    return Array.isArray(policies) ? getPermissionsData(policies, pp) : [];
  }, [policies, permissionPolicies]);
  return {
    loading,
    data,
    retry,
    error: (error as Error) ||
      (permissionPoliciesError as Error) || {
        name: (policies as Response)?.status,
        message: `Error fetching policies. ${(policies as Response)
          ?.statusText}`,
      } || {
        name: (permissionPolicies as Response)?.status,
        message: `Error fetching permission policies. ${(
          permissionPolicies as Response
        )?.statusText}`,
      },
  };
};

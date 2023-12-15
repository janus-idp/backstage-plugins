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

  const { value: permissionPolicies, loading: permissionPoliciesLoading } =
    useAsync(async () => {
      return await rbacApi.listPermissions();
    });

  const loading = policiesLoading && permissionPoliciesLoading;

  const data = React.useMemo(() => {
    const pp = Array.isArray(permissionPolicies) ? permissionPolicies : [];
    return Array.isArray(policies) ? getPermissionsData(policies, pp) : [];
  }, [policies, permissionPolicies]);
  return {
    loading,
    data,
    retry,
    error:
      !Array.isArray(policies) &&
      policies?.status !== 200 &&
      policies?.status !== 204
        ? policies
        : error,
  };
};

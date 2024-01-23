import React from 'react';
import { useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import { getPermissionsData } from '../utils/rbac-utils';

const getErrorText = (
  policies: any,
  permissionPolicies: any,
): { name: number; message: string } | undefined => {
  if (!Array.isArray(policies) && (policies as Response)?.statusText) {
    return {
      name: (policies as Response).status,
      message: `Error fetching policies. ${(policies as Response).statusText}`,
    };
  } else if (
    !Array.isArray(permissionPolicies) &&
    (permissionPolicies as Response)?.statusText
  ) {
    return {
      name: (permissionPolicies as Response).status,
      message: `Error fetching the plugins. ${
        (permissionPolicies as Response).statusText
      }`,
    };
  }
  return undefined;
};

export const usePermissionPolicies = (
  entityReference: string,
  pollInterval?: number,
) => {
  const rbacApi = useApi(rbacApiRef);
  const {
    value: policies,
    retry: policiesRetry,
    error: policiesError,
  } = useAsyncRetry(async () => {
    return await rbacApi.getAssociatedPolicies(entityReference);
  });

  const {
    value: permissionPolicies,
    error: permissionPoliciesError,
    retry: permissionPoliciesRetry,
  } = useAsyncRetry(async () => {
    return await rbacApi.listPermissions();
  });

  const loading =
    !permissionPoliciesError &&
    !policiesError &&
    !policies &&
    !permissionPolicies;

  const data = React.useMemo(() => {
    const pp = Array.isArray(permissionPolicies) ? permissionPolicies : [];
    return Array.isArray(policies) ? getPermissionsData(policies, pp) : [];
  }, [policies, permissionPolicies]);

  useInterval(
    () => {
      policiesRetry();
      permissionPoliciesRetry();
    },
    loading ? null : pollInterval || 10000,
  );
  return {
    loading,
    data,
    retry: { policiesRetry, permissionPoliciesRetry },
    error:
      policiesError ||
      permissionPoliciesError ||
      getErrorText(policies, permissionPolicies),
  };
};

import React from 'react';
import { useAsync, useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { rbacApiRef } from '../api/RBACBackendClient';
import { getPluginsPermissionPoliciesData } from '../utils/create-role-utils';
import {
  getConditionalPermissionsData,
  getPermissionsData,
} from '../utils/rbac-utils';

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

  const { value: conditionalPolicies } = useAsync(async () => {
    return await rbacApi.getRoleConditions(entityReference);
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

  const allPermissionPolicies = React.useMemo(
    () => (Array.isArray(permissionPolicies) ? permissionPolicies : []),
    [permissionPolicies],
  );

  const data = React.useMemo(() => {
    return Array.isArray(policies)
      ? getPermissionsData(policies, allPermissionPolicies)
      : [];
  }, [allPermissionPolicies, policies]);

  const conditionsData = React.useMemo(() => {
    const cpp = Array.isArray(conditionalPolicies) ? conditionalPolicies : [];
    const pluginsPermissionsPoliciesData =
      allPermissionPolicies.length > 0
        ? getPluginsPermissionPoliciesData(allPermissionPolicies)
        : undefined;
    return pluginsPermissionsPoliciesData
      ? getConditionalPermissionsData(cpp, pluginsPermissionsPoliciesData)
      : [];
  }, [allPermissionPolicies, conditionalPolicies]);

  useInterval(
    () => {
      policiesRetry();
      permissionPoliciesRetry();
    },
    loading ? null : pollInterval || null,
  );
  return {
    loading,
    data,
    conditionsData,
    retry: { policiesRetry, permissionPoliciesRetry },
    error:
      policiesError ||
      permissionPoliciesError ||
      getErrorText(policies, permissionPolicies),
  };
};

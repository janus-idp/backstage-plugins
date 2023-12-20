import React from 'react';
import { useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';
import { catalogEntityReadPermission } from '@backstage/plugin-catalog-common/alpha';
import { usePermission } from '@backstage/plugin-permission-react';

import {
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityUpdatePermission,
  Role,
  RoleBasedPolicy,
} from '@janus-idp/backstage-plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';
import { RolesData } from '../types';
import { getPermissions } from '../utils/rbac-utils';

export const useRoles = (
  pollInterval?: number,
): {
  loading: boolean;
  data: RolesData[];
  createRoleAllowed: boolean;
  retry: () => void;
} => {
  const rbacApi = useApi(rbacApiRef);
  const {
    loading: rolesLoading,
    value: roles,
    retry: roleRetry,
  } = useAsyncRetry(async () => await rbacApi.getRoles());

  const { loading: policiesLoading, value: policies } = useAsyncRetry(
    async () => await rbacApi.getPolicies(),
    [],
  );

  const deletePermissionResult = usePermission({
    permission: policyEntityDeletePermission,
    resourceRef: policyEntityDeletePermission.resourceType,
  });

  const policyEntityCreatePermissionResult = usePermission({
    permission: policyEntityCreatePermission,
    resourceRef: policyEntityCreatePermission.resourceType,
  });

  const catalogEntityReadPermissionResult = usePermission({
    permission: catalogEntityReadPermission,
    resourceRef: catalogEntityReadPermission.resourceType,
  });

  const createRoleAllowed =
    policyEntityCreatePermissionResult.allowed &&
    catalogEntityReadPermissionResult.allowed;

  const editPermissionResult = usePermission({
    permission: policyEntityUpdatePermission,
    resourceRef: policyEntityUpdatePermission.resourceType,
  });
  const data: RolesData[] = React.useMemo(
    () =>
      roles && roles?.length > 0
        ? roles.reduce((acc: RolesData[], role: Role) => {
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
                actionsPermissionResults: {
                  delete: deletePermissionResult,
                  edit: editPermissionResult,
                },
              },
            ];
          }, [])
        : [],
    [roles, policies, deletePermissionResult, editPermissionResult],
  );
  const loading = rolesLoading && policiesLoading;
  useInterval(
    () => {
      roleRetry();
    },
    loading ? null : pollInterval || 10000,
  );

  return {
    loading,
    data,
    createRoleAllowed,
    retry: roleRetry,
  };
};

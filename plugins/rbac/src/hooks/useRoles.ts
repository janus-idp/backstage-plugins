import React from 'react';
import { useAsync, useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';
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

type RoleWithConditionalPoliciesCount = Role & {
  conditionalPoliciesCount: number;
};

export const useRoles = (
  pollInterval?: number,
): {
  loading: boolean;
  data: RolesData[];
  createRoleLoading: boolean;
  createRoleAllowed: boolean;
  error: {
    rolesError: string;
    policiesError: string;
    roleConditionError: string;
  };
  retry: { roleRetry: () => void; policiesRetry: () => void };
} => {
  const rbacApi = useApi(rbacApiRef);
  const [newRoles, setNewRoles] = React.useState<
    RoleWithConditionalPoliciesCount[]
  >([]);
  const [roleConditionError, setRoleConditionError] =
    React.useState<string>('');
  const {
    value: roles,
    retry: roleRetry,
    error: rolesError,
  } = useAsyncRetry(async () => await rbacApi.getRoles());

  const {
    value: policies,
    retry: policiesRetry,
    error: policiesError,
  } = useAsyncRetry(async () => await rbacApi.getPolicies(), []);

  const {
    loading: membersLoading,
    value: members,
    error: membersError,
  } = useAsync(async () => {
    return await rbacApi.getMembers();
  });

  const canReadUsersAndGroups =
    !membersLoading &&
    !membersError &&
    Array.isArray(members) &&
    members.length > 0;

  const deletePermissionResult = usePermission({
    permission: policyEntityDeletePermission,
    resourceRef: policyEntityDeletePermission.resourceType,
  });

  const policyEntityCreatePermissionResult = usePermission({
    permission: policyEntityCreatePermission,
    resourceRef: policyEntityCreatePermission.resourceType,
  });

  const createRoleLoading =
    policyEntityCreatePermissionResult.loading || membersLoading;

  const createRoleAllowed =
    policyEntityCreatePermissionResult.allowed && canReadUsersAndGroups;

  const editPermissionResult = usePermission({
    permission: policyEntityUpdatePermission,
    resourceRef: policyEntityUpdatePermission.resourceType,
  });

  React.useEffect(() => {
    const fetchAllPermissionPolicies = async () => {
      if (!Array.isArray(roles)) return;
      const failedFetchConditionRoles: string[] = [];
      const conditionPromises = roles.map(async role => {
        try {
          const conditionalPolicies = await rbacApi.getRoleConditions(
            role.name,
          );

          if ((conditionalPolicies as any as Response)?.statusText) {
            failedFetchConditionRoles.push(role.name);
            throw new Error(
              (conditionalPolicies as any as Response).statusText,
            );
          }
          return {
            ...role,
            conditionalPoliciesCount: Array.isArray(conditionalPolicies)
              ? conditionalPolicies.length
              : 0,
          };
        } catch (error) {
          setRoleConditionError(
            `Error fetching role conditions for ${failedFetchConditionRoles.length > 1 ? 'roles' : 'role'} ${failedFetchConditionRoles.join(', ')}, please try again later.`,
          );
          return {
            ...role,
            conditionalPoliciesCount: 0,
          };
        }
      });

      const updatedRoles = await Promise.all(conditionPromises);
      setNewRoles(updatedRoles);
    };

    fetchAllPermissionPolicies();
  }, [roles, rbacApi]);

  const data: RolesData[] = React.useMemo(
    () =>
      Array.isArray(newRoles) && newRoles?.length > 0
        ? newRoles.reduce(
            (acc: RolesData[], role: RoleWithConditionalPoliciesCount) => {
              const permissions = getPermissions(
                role.name,
                policies as RoleBasedPolicy[],
              );

              return [
                ...acc,
                {
                  id: role.name,
                  name: role.name,
                  description: role.metadata?.description ?? '-',
                  members: role.memberReferences,
                  permissions: role.conditionalPoliciesCount + permissions,
                  modifiedBy: '-',
                  lastModified: '-',
                  actionsPermissionResults: {
                    delete: deletePermissionResult,
                    edit: {
                      allowed:
                        editPermissionResult.allowed && canReadUsersAndGroups,
                      loading: editPermissionResult.loading,
                    },
                  },
                },
              ];
            },
            [],
          )
        : [],
    [
      newRoles,
      policies,
      deletePermissionResult,
      editPermissionResult.allowed,
      editPermissionResult.loading,
      canReadUsersAndGroups,
    ],
  );
  const loading = !rolesError && !policiesError && !roles && !policies;

  useInterval(
    () => {
      roleRetry();
      policiesRetry();
    },
    loading ? null : pollInterval || 10000,
  );

  return {
    loading,
    data,
    error: {
      rolesError: (rolesError?.message ||
        (typeof roles === 'object'
          ? (roles as any as Response)?.statusText
          : '')) as string,
      policiesError: (policiesError?.message ||
        (typeof policies === 'object'
          ? (policies as any as Response)?.statusText
          : '')) as string,
      roleConditionError,
    },
    createRoleLoading,
    createRoleAllowed,
    retry: { roleRetry, policiesRetry },
  };
};

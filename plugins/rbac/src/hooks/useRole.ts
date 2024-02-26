import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { Role } from '@janus-idp/backstage-plugin-rbac-common';

import { rbacApiRef } from '../api/RBACBackendClient';

export const useRole = (
  roleEntityRef: string,
): {
  loading: boolean;
  role: Role | undefined;
  roleError: Error;
} => {
  const rbacApi = useApi(rbacApiRef);
  const {
    value: roles,
    loading,
    error: roleError,
  } = useAsync(async () => await rbacApi.getRole(roleEntityRef));

  return {
    loading,
    role: Array.isArray(roles) ? roles[0] : undefined,
    roleError: (roleError as Error) || {
      name: (roles as Response)?.status,
      message: `Error fetching the role. ${(roles as Response)?.statusText}`,
    },
  };
};

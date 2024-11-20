import { useApi } from '@backstage/core-plugin-api';
import {
  AuthorizeResult,
  Permission,
  ResourcePermission,
} from '@backstage/plugin-permission-common';
import {
  AsyncPermissionResult,
  permissionApiRef,
} from '@backstage/plugin-permission-react';

import useSWR from 'swr';

type InputType = Exclude<Permission, ResourcePermission>;

export type AsyncPermissionBatchResult = Omit<
  AsyncPermissionResult,
  'allowed'
> & {
  allowed: boolean[];
};

/**
 * Like usePermission() from '@backstage/plugin-permission-react' but for multiple permissions at once.
 *
 * @param permissions
 * @returns Object similar to AsyncPermissionResult but the "allowed" is a boolean array.
 */

export const usePermissionArray = (
  permissions: InputType[],
): AsyncPermissionBatchResult => {
  const permissionApi = useApi(permissionApiRef);

  const { data, error } = useSWR(permissions, async (args: InputType[]) => {
    const result = await Promise.all(
      args.map(permission => permissionApi.authorize({ permission })),
    );

    return result;
  });

  if (error) {
    return { error, loading: false, allowed: permissions.map(_ => false) };
  }
  if (data === undefined) {
    return { loading: true, allowed: permissions.map(_ => false) };
  }

  return {
    loading: false,
    allowed: data.map(d => d.result === AuthorizeResult.ALLOW),
  };
};

/**
 * Handy function returning AsyncPermissionResult which is ALLOWED if at least one of the permission is allowed.
 *
 * @param permissions
 */
export const usePermissionArrayDecision = (
  permissions: InputType[],
): AsyncPermissionResult => {
  const result = usePermissionArray(permissions);

  return {
    loading: result.loading,
    error: result.error,
    // Allow if any permission grants it
    allowed: !!result.allowed.find(d => d),
  };
};

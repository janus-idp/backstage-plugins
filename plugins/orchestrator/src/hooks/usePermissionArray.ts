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

/**
 * Like usePermission() from '@backstage/plugin-permission-react' but for multiple permissions at once.
 *
 * @param permissions
 * @returns Object of the AsyncPermissionResult type which is ALLOWED if at least one of the permission is allowed.
 */
export const usePermissionArray = (
  permissions: InputType[],
): AsyncPermissionResult => {
  const permissionApi = useApi(permissionApiRef);

  const { data, error } = useSWR(permissions, async (args: InputType[]) => {
    const result = await Promise.all(
      args.map(permission => permissionApi.authorize({ permission })),
    );

    return result;
  });

  if (error) {
    return { error, loading: false, allowed: false };
  }
  if (data === undefined) {
    return { loading: true, allowed: false };
  }

  // Allow if any permission grants it
  const allowed = !!data.find(d => d.result === AuthorizeResult.ALLOW);
  return { loading: false, allowed };
};

export type AsyncPermissionBatchResult = {
  loading: boolean;
  error?: boolean;
  allowed: boolean[];
};

/**
 * Request permissions in a batch.
 *
 * Potential optimization: move to backend since this implementation sends (items.length X permissions' count) HTTP requests.
 *
 * @param items An array of items to request the permissions for. Similar to usePermissionArray() which sends the same request but for a single item.
 * @param getPermissions Callback mapping an input item to array of permissions to be queried.
 *
 * @returns An object similar to the AsyncPermissionResult but the "allowed" property is a boolean array which indexes conform to the input "items".
 */
export function usePermissionArrayBatch<T>(
  items: T[],
  getPermissions: (item: T) => InputType[],
): AsyncPermissionBatchResult {
  const permissionApi = useApi(permissionApiRef);

  const { data, error } = useSWR(items, async (args: T[]) => {
    const allPermissions = args.map(getPermissions);

    const result: boolean[] = await Promise.all(
      allPermissions.map(async (itemPermissions: InputType[]) => {
        const itemDecisions = await Promise.all(
          itemPermissions.map(permission =>
            permissionApi.authorize({ permission }),
          ),
        );
        return !!itemDecisions.find(d => d.result === AuthorizeResult.ALLOW);
      }),
    );

    return result;
  });

  if (error) {
    return { error, loading: false, allowed: items.map(_ => false) };
  }
  if (data === undefined) {
    return { loading: true, allowed: items.map(_ => false) };
  }

  return {
    loading: false,
    allowed: data,
  };
}

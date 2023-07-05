import {
  createPermission,
  ResourcePermission,
} from '@backstage/plugin-permission-common';

export const RESOURCE_TYPE_PERMISSION_ENTITY = 'permission-entity';

/**
 * Convenience type for permission entity
 */
export type PermissionEntityPermission = ResourcePermission<
  typeof RESOURCE_TYPE_PERMISSION_ENTITY
>;

/**
 * This permission is used to authorize actions that involve reading
 * permission policies.
 */
export const permissionEntityReadPermission = createPermission({
  name: 'permission.entity.read',
  attributes: {
    action: 'read',
  },
  resourceType: RESOURCE_TYPE_PERMISSION_ENTITY,
});

/**
 * This permission is used to authorize the creation of new permission policies.
 */
export const permissionEntityCreatePermission = createPermission({
  name: 'permission.entity.create',
  attributes: {
    action: 'create',
  },
});

/**
 * This permission is used to authorize actions that involve removing permission
 * policies.
 */
export const permissionEntityDeletePermission = createPermission({
  name: 'permission.entity.delete',
  attributes: {
    action: 'delete',
  },
  resourceType: RESOURCE_TYPE_PERMISSION_ENTITY,
});

/**
 * This permission is used to authorize refreshing permission policies
 */
export const permissionEntityRefreshPermission = createPermission({
  name: 'permission.entity.refresh',
  attributes: {
    action: 'update',
  },
  resourceType: RESOURCE_TYPE_PERMISSION_ENTITY,
});

/**
 * List of all permissions on permission polices.
 */
export const permissionEntityPermissions = [
  permissionEntityReadPermission,
  permissionEntityCreatePermission,
  permissionEntityDeletePermission,
  permissionEntityRefreshPermission,
];

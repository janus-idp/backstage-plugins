import {
  createPermission,
  ResourcePermission,
} from '@backstage/plugin-permission-common';

export const RESOURCE_TYPE_POLICY_ENTITY = 'policy-entity';
export const RESOURCE_TYPE_PLUGIN_POLICY_ENTITY = 'plugin-policy-entity';

/**
 * Convenience type for permission entity
 */
export type PolicyEntityPermission = ResourcePermission<
  typeof RESOURCE_TYPE_POLICY_ENTITY
>;

/**
 * This permission is used to authorize actions that involve reading
 * permission policies.
 */
export const policyEntityReadPermission = createPermission({
  name: 'policy.entity.read',
  attributes: {
    action: 'read',
  },
  resourceType: RESOURCE_TYPE_POLICY_ENTITY,
});

/**
 * This permission is used to authorize the creation of new permission policies.
 */
export const policyEntityCreatePermission = createPermission({
  name: 'policy.entity.create',
  attributes: {
    action: 'create',
  },
  resourceType: RESOURCE_TYPE_POLICY_ENTITY,
});

/**
 * This permission is used to authorize actions that involve removing permission
 * policies.
 */
export const policyEntityDeletePermission = createPermission({
  name: 'policy.entity.delete',
  attributes: {
    action: 'delete',
  },
  resourceType: RESOURCE_TYPE_POLICY_ENTITY,
});

/**
 * This permission is used to authorize updating permission policies
 */
export const policyEntityUpdatePermission = createPermission({
  name: 'policy.entity.update',
  attributes: {
    action: 'update',
  },
  resourceType: RESOURCE_TYPE_POLICY_ENTITY,
});

/**
 * List of all permissions on permission polices.
 */
export const policyEntityPermissions = [
  policyEntityReadPermission,
  policyEntityCreatePermission,
  policyEntityDeletePermission,
  policyEntityUpdatePermission,
];

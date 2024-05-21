import { createPermission } from '@backstage/plugin-permission-common';

export const topologyViewPermission = createPermission({
  name: 'topology.view.read',
  attributes: {
    action: 'read',
  },
});

/**
 * List of all permissions on permission polices.
 */
export const topologyPermissions = [topologyViewPermission];

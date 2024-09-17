import { createPermission } from '@backstage/plugin-permission-common';

export const quayViewPermission = createPermission({
  name: 'quay.view.read',
  attributes: {
    action: 'read',
  },
});

/**
 * List of all permissions on permission polices.
 */
export const quayPermissions = [quayViewPermission];

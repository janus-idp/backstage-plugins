import { createPermission } from '@backstage/plugin-permission-common';

export const tektonViewPermission = createPermission({
  name: 'tekton.view.read',
  attributes: {
    action: 'read',
  },
});

/**
 * List of all permissions on permission polices.
 */
export const tektonPermissions = [tektonViewPermission];

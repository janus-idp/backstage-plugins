import { createPermission } from '@backstage/plugin-permission-common';

export const ocmClusterReadPermission = createPermission({
  name: 'ocm.cluster.read',
  attributes: {
    action: 'read',
  },
});

export const ocmEntityReadPermission = createPermission({
  name: 'ocm.entity.read',
  attributes: {
    action: 'read',
  },
});

export const ocmEntityPermissions = [
  ocmClusterReadPermission,
  ocmEntityReadPermission,
];

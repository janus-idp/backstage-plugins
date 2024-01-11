import { createPermission } from '@backstage/plugin-permission-common';

export const notificationsCreatePermission = createPermission({
  name: 'notifications.create',
  attributes: { action: 'create' },
});

export const notificationsReadPermission = createPermission({
  name: 'notifications.list',
  attributes: { action: 'read' },
});

export const notificationsSetReadPermission = createPermission({
  name: 'notifications.update.read',
  attributes: { action: 'update' },
});

export const notificationsPermissions = [
  notificationsCreatePermission,
  notificationsReadPermission,
  notificationsSetReadPermission,
];

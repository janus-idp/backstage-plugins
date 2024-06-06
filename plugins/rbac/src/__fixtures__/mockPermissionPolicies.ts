import { PermissionPolicy } from '@janus-idp/backstage-plugin-rbac-common';

export const mockPermissionPolicies: PermissionPolicy[] = [
  {
    pluginId: 'catalog',
    policies: [
      {
        permission: 'catalog-entity',
        name: 'catalog.entity.read',
        policy: 'read',
        isResourced: true,
      },
      {
        permission: 'catalog.entity.create',
        policy: 'create',
        isResourced: false,
      },
      {
        permission: 'catalog-entity',
        name: 'catalog.entity.delete',
        policy: 'delete',
        isResourced: true,
      },
      {
        permission: 'catalog-entity',
        name: 'catalog.entity.update',
        policy: 'update',
        isResourced: true,
      },
      {
        permission: 'catalog.location.read',
        policy: 'read',
        isResourced: false,
      },
      {
        permission: 'catalog.location.create',
        policy: 'create',
        isResourced: false,
      },
      {
        permission: 'catalog.location.delete',
        policy: 'delete',
        isResourced: false,
      },
    ],
  },
  {
    pluginId: 'scaffolder',
    policies: [
      {
        permission: 'scaffolder-template',
        name: 'scaffolder.template.read',
        policy: 'read',
        isResourced: true,
      },
      {
        permission: 'scaffolder-template',
        name: 'scaffolder.template.read',
        policy: 'read',
        isResourced: true,
      },
      {
        permission: 'scaffolder-action',
        name: 'scaffolder.action.use',
        policy: 'use',
        isResourced: true,
      },
    ],
  },
  {
    pluginId: 'permission',
    policies: [
      {
        permission: 'policy-entity',
        policy: 'read',
        isResourced: false,
      },
      {
        permission: 'policy-entity',
        policy: 'create',
        isResourced: false,
      },
      {
        permission: 'policy-entity',
        policy: 'delete',
        isResourced: false,
      },
      {
        permission: 'policy-entity',
        policy: 'update',
        isResourced: false,
      },
    ],
  },
];

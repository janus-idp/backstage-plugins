import { PermissionPolicy } from '@janus-idp/backstage-plugin-rbac-common';

export const mockPermissionPolicies: PermissionPolicy[] = [
  {
    pluginId: 'catalog',
    policies: [
      {
        permission: 'catalog-entity',
        policy: 'read',
      },
      {
        permission: 'catalog.entity.create',
        policy: 'create',
      },
      {
        permission: 'catalog-entity',
        policy: 'delete',
      },
      {
        permission: 'catalog-entity',
        policy: 'update',
      },
      {
        permission: 'catalog.location.read',
        policy: 'read',
      },
      {
        permission: 'catalog.location.create',
        policy: 'create',
      },
      {
        permission: 'catalog.location.delete',
        policy: 'delete',
      },
    ],
  },
  {
    pluginId: 'scaffolder',
    policies: [
      {
        permission: 'scaffolder-template',
        policy: 'read',
      },
      {
        permission: 'scaffolder-template',
        policy: 'read',
      },
      {
        permission: 'scaffolder-action',
        policy: 'use',
      },
    ],
  },
  {
    pluginId: 'permission',
    policies: [
      {
        permission: 'policy-entity',
        policy: 'read',
      },
      {
        permission: 'policy-entity',
        policy: 'create',
      },
      {
        permission: 'policy-entity',
        policy: 'delete',
      },
      {
        permission: 'policy-entity',
        policy: 'update',
      },
    ],
  },
];

import { PluginPermissionMetaData } from '@janus-idp/backstage-plugin-rbac-common';

export const mockPermissionPolicies: PluginPermissionMetaData[] = [
  {
    pluginId: 'catalog',
    policies: [
      {
        resourceType: 'catalog-entity',
        name: 'catalog.entity.read',
        policy: 'read',
      },
      {
        name: 'catalog.entity.create',
        policy: 'create',
      },
      {
        resourceType: 'catalog-entity',
        name: 'catalog.entity.delete',
        policy: 'delete',
      },
      {
        resourceType: 'catalog-entity',
        name: 'catalog.entity.update',
        policy: 'update',
      },
      {
        name: 'catalog.location.read',
        policy: 'read',
      },
      {
        name: 'catalog.location.create',
        policy: 'create',
      },
      {
        name: 'catalog.location.delete',
        policy: 'delete',
      },
    ],
  },
  {
    pluginId: 'scaffolder',
    policies: [
      {
        resourceType: 'scaffolder-template',
        name: 'scaffolder.template.read',
        policy: 'read',
      },
      {
        resourceType: 'scaffolder-template',
        name: 'scaffolder.template.read',
        policy: 'read',
      },
      {
        resourceType: 'scaffolder-action',
        name: 'scaffolder.action.use',
        policy: 'use',
      },
    ],
  },
  {
    pluginId: 'permission',
    policies: [
      {
        name: 'policy-entity',
        policy: 'read',
      },
      {
        name: 'policy-entity',
        policy: 'create',
      },
      {
        name: 'policy-entity',
        policy: 'delete',
      },
      {
        name: 'policy-entity',
        policy: 'update',
      },
    ],
  },
];

import { AuthorizeResult } from '@backstage/plugin-permission-common';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

export const mockConditions: RoleConditionalPolicyDecision<PermissionAction>[] =
  [
    {
      id: 1,
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      conditions: {
        rule: 'HAS_ANNOTATION',
        resourceType: 'catalog-entity',
        params: { annotation: 'temp' },
      },
      roleEntityRef: 'role:default/rbac_admin',
      permissionMapping: ['read'],
    },
    {
      id: 2,
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      conditions: {
        allOf: [
          {
            rule: 'HAS_LABEL',
            resourceType: 'catalog-entity',
            params: { label: 'temp' },
          },
          {
            rule: 'HAS_METADATA',
            resourceType: 'catalog-entity',
            params: { key: 'status' },
          },
        ],
      },
      roleEntityRef: 'role:default/rbac_admin',
      permissionMapping: ['delete', 'update'],
    },
  ];

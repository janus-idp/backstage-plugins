import { AuthorizeResult } from '@backstage/plugin-permission-common';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

import { RoleBasedConditions } from '../types';

export const mockNewConditions: RoleBasedConditions[] = [
  {
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

export const mockConditions: RoleConditionalPolicyDecision<PermissionAction>[] =
  [
    {
      id: 1,
      ...mockNewConditions[0],
    },
    {
      id: 2,
      ...mockNewConditions[1],
    },
  ];

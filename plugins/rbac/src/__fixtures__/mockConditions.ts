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
    {
      id: 3,
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      conditions: {
        anyOf: [
          {
            rule: 'IS_ENTITY_OWNER',
            resourceType: 'catalog-entity',
            params: {
              claims: ['user:default/ciiay'],
            },
          },
          {
            rule: 'IS_ENTITY_KIND',
            resourceType: 'catalog-entity',
            params: { kinds: ['Group'] },
          },
          {
            allOf: [
              {
                rule: 'IS_ENTITY_OWNER',
                resourceType: 'catalog-entity',
                params: {
                  claims: ['user:default/ciiay'],
                },
              },
              {
                rule: 'IS_ENTITY_KIND',
                resourceType: 'catalog-entity',
                params: {
                  kinds: ['User'],
                },
              },
              {
                not: {
                  rule: 'HAS_LABEL',
                  resourceType: 'catalog-entity',
                  params: { label: 'temp' },
                },
              },
              {
                anyOf: [
                  {
                    rule: 'HAS_TAG',
                    resourceType: 'catalog-entity',
                    params: { tag: 'dev' },
                  },
                  {
                    rule: 'HAS_TAG',
                    resourceType: 'catalog-entity',
                    params: { tag: 'test' },
                  },
                ],
              },
            ],
          },
          {
            not: {
              allOf: [
                {
                  rule: 'IS_ENTITY_OWNER',
                  resourceType: 'catalog-entity',
                  params: {
                    claims: ['user:default/xyz'],
                  },
                },
                {
                  rule: 'IS_ENTITY_KIND',
                  resourceType: 'catalog-entity',
                  params: {
                    kinds: ['User'],
                  },
                },
              ],
            },
          },
        ],
      },
      roleEntityRef: 'role:default/rbac_admin',
      permissionMapping: ['read', 'delete', 'update'],
    },
    {
      id: 4,
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'catalog',
      resourceType: 'catalog-entity',
      conditions: {
        not: {
          rule: 'HAS_LABEL',
          resourceType: 'catalog-entity',
          params: { label: 'temp' },
        },
      },
      roleEntityRef: 'role:default/rbac_admin',
      permissionMapping: ['delete', 'update'],
    },
    {
      id: 5,
      result: AuthorizeResult.CONDITIONAL,
      pluginId: 'scaffolder',
      resourceType: 'scaffolder-template',
      conditions: {
        not: {
          anyOf: [
            {
              rule: 'HAS_TAG',
              resourceType: 'scaffolder-template',
              params: { tag: 'dev' },
            },
            {
              rule: 'HAS_TAG',
              resourceType: 'scaffolder-template',
              params: { tag: 'test' },
            },
          ],
        },
      },
      roleEntityRef: 'role:default/rbac_admin',
      permissionMapping: ['read'],
    },
  ];

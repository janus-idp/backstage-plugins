import { GroupEntity } from '@backstage/catalog-model';
import {
  AllOfCriteria,
  AuthorizeResult,
  PermissionCondition,
} from '@backstage/plugin-permission-common';

import {
  PermissionAction,
  RoleConditionalPolicyDecision,
} from '@janus-idp/backstage-plugin-rbac-common';

import { mockConditions } from '../__fixtures__/mockConditions';
import { mockPermissionPolicies } from '../__fixtures__/mockPermissionPolicies';
import {
  getConditionalPermissionsData,
  getConditionsData,
  getConditionUpperCriteria,
  getKindNamespaceName,
  getMembers,
  getMembersFromGroup,
  getPermissions,
  getPermissionsData,
  getPluginInfo,
  getPoliciesData,
} from './rbac-utils';

const mockPolicies = [
  {
    entityReference: 'role:default/guests',
    permission: 'catalog-entity',
    policy: 'read',
    effect: 'deny',
  },
  {
    entityReference: 'role:default/guests',
    permission: 'catalog.entity.create',
    policy: 'use',
    effect: 'deny',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'policy-entity',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'policy-entity',
    policy: 'create',
    effect: 'allow',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'policy-entity',
    policy: 'delete',
    effect: 'allow',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'catalog-entity',
    policy: 'read',
    effect: 'allow',
  },
  {
    entityReference: 'user:default/xyz',
    permission: 'catalog.entity.create',
    policy: 'use',
    effect: 'allow',
  },
];

describe('rbac utils', () => {
  it('should list associated allowed permissions for a role', () => {
    expect(getPermissions('role:default/guests', mockPolicies)).toBe(0);
    expect(getPermissions('user:default/xyz', mockPolicies)).toBe(5);
  });

  it('should return number of users and groups in member references', () => {
    expect(getMembers(['user:default/xyz', 'group:default/admins'])).toBe(
      '1 user, 1 group',
    );

    expect(
      getMembers([
        'user:default/xyz',
        'group:default/admins',
        'user:default/alice',
      ]),
    ).toBe('2 users, 1 group');

    expect(getMembers(['user:default/xyz'])).toBe('1 user');

    expect(getMembers(['group:default/xyz'])).toBe('1 group');

    expect(getMembers([])).toBe('No members');
  });

  it('should return number of members in a group', () => {
    let resource: GroupEntity = {
      metadata: {
        namespace: 'default',
        annotations: {},
        name: 'team-b',
        description: 'Team B',
      },
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      spec: {
        type: 'team',
        profile: {},
        parent: 'backstage',
        children: [],
      },
      relations: [
        {
          type: 'childOf',
          targetRef: 'group:default/backstage',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/amelia.park',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/colette.brock',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/jenny.doe',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/jonathon.page',
        },
        {
          type: 'hasMember',
          targetRef: 'user:default/justine.barrow',
        },
      ],
    };
    expect(getMembersFromGroup(resource)).toBe(5);

    resource = {
      metadata: {
        namespace: 'default',
        annotations: {},
        name: 'team-b',
        description: 'Team B',
      },
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      spec: {
        type: 'team',
        profile: {},
        parent: 'backstage',
        children: [],
      },
      relations: [
        {
          type: 'childOf',
          targetRef: 'group:default/backstage',
        },
      ],
    };

    expect(getMembersFromGroup(resource)).toBe(0);
  });

  it('should return plugin-id of the policy', () => {
    expect(
      getPluginInfo(mockPermissionPolicies, 'catalog-entity').pluginId,
    ).toBe('catalog');
    expect(
      getPluginInfo(mockPermissionPolicies, 'scaffolder-template').pluginId,
    ).toBe('scaffolder');
  });

  it('should return if the permission is resourced', () => {
    expect(
      getPluginInfo(mockPermissionPolicies, 'catalog-entity').isResourced,
    ).toBe(true);
    expect(
      getPluginInfo(mockPermissionPolicies, 'scaffolder-template').isResourced,
    ).toBe(true);
  });

  it('should return kind, namespace and name from the reference', () => {
    expect(getKindNamespaceName('role:default/xyz')).toEqual({
      kind: 'role',
      namespace: 'default',
      name: 'xyz',
    });
    expect(getKindNamespaceName('role:abc/test')).toEqual({
      kind: 'role',
      namespace: 'abc',
      name: 'test',
    });
  });

  it('should return the permissions data', () => {
    let data = getPermissionsData(mockPolicies, mockPermissionPolicies);
    expect(data[0]).toEqual({
      permission: 'policy-entity',
      plugin: 'permission',
      policies: [
        {
          effect: 'allow',
          policy: 'Read',
        },
        {
          effect: 'allow',
          policy: 'Create',
        },
        {
          effect: 'allow',
          policy: 'Delete',
        },
        {
          effect: 'deny',
          policy: 'Update',
        },
      ],
      policyString: ['Read', ', Create', ', Delete'],
      isResourced: false,
    });
    data = getPermissionsData(mockPolicies, []);
    expect(data[0]).toEqual({
      permission: 'policy-entity',
      plugin: '-',
      policies: [
        {
          effect: 'allow',
          policy: 'Read',
        },
        {
          effect: 'allow',
          policy: 'Create',
        },
        {
          effect: 'allow',
          policy: 'Delete',
        },
      ],
      policyString: ['Read', ', Create', ', Delete'],
      isResourced: false,
    });
  });
});

describe('getConditionUpperCriteria', () => {
  it('should return the upper criteria', () => {
    const conditions = mockConditions[1].conditions;

    const result = getConditionUpperCriteria(conditions);

    expect(result).toEqual('allOf');
  });

  it('should return undefined if no upper criteria is found', () => {
    const conditions = mockConditions[0].conditions;

    const result = getConditionUpperCriteria(conditions);

    expect(result).toBeUndefined();
  });
});

describe('getConditionsData', () => {
  it('should return conditions data correctly for simple condition', () => {
    const conditions = mockConditions[0].conditions;

    const result = getConditionsData(conditions);

    expect(result).toEqual({
      condition: {
        rule: 'HAS_ANNOTATION',
        resourceType: 'catalog-entity',
        params: { annotation: 'temp' },
      },
    });
  });

  it('should return conditions data correctly for any upper criteria', () => {
    const conditions = mockConditions[1].conditions;

    const result = getConditionsData(conditions);

    expect(result).toEqual({
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
    });
  });

  it('should return undefined if nested condition exists', () => {
    const conditions = {
      allOf: [mockConditions[1].conditions, mockConditions[0].conditions],
    } as AllOfCriteria<PermissionCondition>;

    const result = getConditionsData(conditions);

    expect(result).toBeUndefined();
  });
});

describe('getPoliciesData', () => {
  it('should return policies data correctly', () => {
    const allowedPermissions = ['read', 'update'];
    const policies = ['read', 'update', 'delete'];

    const result = getPoliciesData(allowedPermissions, policies);

    expect(result).toEqual([
      { policy: 'read', effect: 'allow' },
      { policy: 'update', effect: 'allow' },
      { policy: 'delete', effect: 'deny' },
    ]);
  });

  it('should return empty array if no policies provided', () => {
    const allowedPermissions = ['read', 'write'];
    const policies: string[] = [];

    const result = getPoliciesData(allowedPermissions, policies);

    expect(result).toEqual([]);
  });

  it('should return all policies as deny if no allowed permissions provided', () => {
    const allowedPermissions: string[] = [];
    const policies = ['read', 'update', 'delete'];

    const result = getPoliciesData(allowedPermissions, policies);

    expect(result).toEqual([
      { policy: 'read', effect: 'deny' },
      { policy: 'update', effect: 'deny' },
      { policy: 'delete', effect: 'deny' },
    ]);
  });
});

describe('getConditionalPermissionsData', () => {
  it('should return conditional permissions data correctly', () => {
    const conditionalPermissions = [mockConditions[0]];
    const permissionPolicies = {
      plugins: ['catalog'],
      pluginsPermissions: {
        ['catalog']: {
          permissions: ['catalog-entity'],
          policies: {
            ['catalog-entity']: {
              policies: ['read', 'update', 'delete'],
              isResourced: true,
            },
          },
        },
      },
    };

    const result = getConditionalPermissionsData(
      conditionalPermissions,
      permissionPolicies,
    );

    expect(result).toEqual([
      {
        plugin: 'catalog',
        permission: 'catalog-entity',
        isResourced: true,
        policies: [
          { policy: 'read', effect: 'allow' },
          { policy: 'update', effect: 'deny' },
          { policy: 'delete', effect: 'deny' },
        ],
        policyString: 'Read',
        conditions: {
          condition: {
            rule: 'HAS_ANNOTATION',
            resourceType: 'catalog-entity',
            params: { annotation: 'temp' },
          },
        },
        id: 1,
      },
    ]);
  });

  it('should return empty array if no conditional permissions provided', () => {
    const conditionalPermissions: RoleConditionalPolicyDecision<PermissionAction>[] =
      [];
    const permissionPolicies = {
      plugins: ['catalog'],
      pluginsPermissions: {
        ['catalog']: {
          permissions: ['catalog-entity'],
          policies: {
            ['catalog-entity']: {
              policies: ['read', 'update', 'delete'],
              isResourced: true,
            },
          },
        },
      },
    };

    const result = getConditionalPermissionsData(
      conditionalPermissions,
      permissionPolicies,
    );

    expect(result).toEqual([]);
  });

  it('should skip conditional permission with nested upper criteria', () => {
    const conditionalPermissions = [
      {
        id: 1,
        pluginId: 'catalog',
        result: AuthorizeResult.CONDITIONAL,
        resourceType: 'catalog-entity',
        permissionMapping: ['read'],
        conditions: {
          allOf: [mockConditions[1].conditions, mockConditions[0].conditions],
        } as AllOfCriteria<PermissionCondition>,
      },
    ] as RoleConditionalPolicyDecision<PermissionAction>[];

    const permissionPolicies = {
      plugins: ['catalog'],
      pluginsPermissions: {
        ['catalog']: {
          permissions: ['catalog-entity'],
          policies: {
            ['catalog-entity']: {
              policies: ['read', 'update', 'delete'],
              isResourced: true,
            },
          },
        },
      },
    };
    const result = getConditionalPermissionsData(
      conditionalPermissions,
      permissionPolicies,
    );

    expect(result).toEqual([]);
  });
});

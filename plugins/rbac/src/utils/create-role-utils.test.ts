import { mockMembers } from '../__fixtures__/mockMembers';
import { mockPermissionPolicies } from '../__fixtures__/mockPermissionPolicies';
import {
  getChildGroupsCount,
  getMembersCount,
  getParentGroupsCount,
  getPermissionPolicies,
  getPermissionPoliciesData,
  getPluginsPermissionPoliciesData,
  getRoleData,
} from './create-role-utils';

describe('getRoleData', () => {
  it('should return role data object', () => {
    let values = {
      name: 'testRole',
      namespace: 'default',
      kind: 'group',
      selectedMembers: [
        {
          type: 'User',
          namespace: 'default',
          label: 'user1',
          etag: '1',
          ref: 'user:default/user1',
        },
        {
          type: 'Group',
          namespace: 'default',
          label: 'group1',
          etag: '2',
          ref: 'group:default/group1',
        },
      ],
      permissionPoliciesRows: [
        {
          plugin: '',
          permission: '',
          policies: [
            { policy: 'Create', effect: 'deny' },
            { policy: 'Read', effect: 'deny' },
            { policy: 'Update', effect: 'deny' },
            { policy: 'Delete', effect: 'deny' },
          ],
        },
      ],
    };

    let result = getRoleData(values);

    expect(result).toEqual({
      memberReferences: ['user:default/user1', 'group:default/group1'],
      name: 'group:default/testRole',
    });

    values = {
      name: 'testRole',
      namespace: 'default',
      kind: 'user',
      selectedMembers: [
        {
          type: 'User',
          namespace: 'default',
          label: 'user1',
          etag: '1',
          ref: 'user:default/user1',
        },
        {
          type: 'Group',
          namespace: 'default',
          label: 'group1',
          etag: '2',
          ref: 'group:default/group1',
        },
      ],
      permissionPoliciesRows: [
        {
          plugin: '',
          permission: '',
          policies: [
            { policy: 'Create', effect: 'deny' },
            { policy: 'Read', effect: 'deny' },
            { policy: 'Update', effect: 'deny' },
            { policy: 'Delete', effect: 'deny' },
          ],
        },
      ],
    };

    result = getRoleData(values);

    expect(result).toEqual({
      memberReferences: ['user:default/user1', 'group:default/group1'],
      name: 'user:default/testRole',
    });
  });
});

describe('getMembersCount', () => {
  it('should return the number of members for a group', () => {
    const group = mockMembers[0];

    const result = getMembersCount(group);

    expect(result).toBe(2);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getMembersCount(user);

    expect(result).toBeUndefined();
  });
});

describe('getParentGroupsCount', () => {
  it('should return the number of parent groups for a group', () => {
    const group = mockMembers[0];

    const result = getParentGroupsCount(group);

    expect(result).toBe(1);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getParentGroupsCount(user);

    expect(result).toBeUndefined();
  });
});

describe('getChildGroupsCount', () => {
  it('should return the number of child groups for a group', () => {
    const group = mockMembers[8];

    const result = getChildGroupsCount(group);

    expect(result).toBe(2);
  });

  it('should return undefined for non-group entities', () => {
    const user = mockMembers[2];

    const result = getChildGroupsCount(user);

    expect(result).toBeUndefined();
  });
});

describe('getPermissionPolicies', () => {
  test('returns empty object for empty input', () => {
    const result = getPermissionPolicies([]);
    expect(result).toEqual({});
  });

  test('correctly transforms policies into PermissionPolicies', () => {
    const policies = [
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
    ];
    const result = getPermissionPolicies(policies);
    expect(result).toEqual({
      'catalog-entity': ['Read', 'Delete', 'Update'],
      'catalog.entity.create': ['Create'],
    });
  });
});

describe('getPluginsPermissionPoliciesData', () => {
  test('returns empty object for empty input', () => {
    const result = getPluginsPermissionPoliciesData([]);
    expect(result).toEqual({ plugins: [], pluginsPermissions: {} });
  });

  test('correctly transforms pluginsPermissionPolicies', () => {
    const result = getPluginsPermissionPoliciesData(mockPermissionPolicies);
    expect(result).toEqual({
      plugins: ['catalog', 'scaffolder', 'permission'],
      pluginsPermissions: {
        catalog: {
          permissions: [
            'catalog-entity',
            'catalog.entity.create',
            'catalog.location.read',
            'catalog.location.create',
            'catalog.location.delete',
          ],
          policies: {
            'catalog-entity': ['Read', 'Delete', 'Update'],
            'catalog.entity.create': ['Create'],
            'catalog.location.read': ['Read'],
            'catalog.location.create': ['Create'],
            'catalog.location.delete': ['Delete'],
          },
        },
        scaffolder: {
          permissions: ['scaffolder-template', 'scaffolder-action'],
          policies: {
            'scaffolder-template': ['Read'],
            'scaffolder-action': ['Use'],
          },
        },
        permission: {
          permissions: ['policy-entity'],
          policies: {
            'policy-entity': ['Read', 'Create', 'Delete', 'Update'],
          },
        },
      },
    });
  });
});

describe('getPermissionPoliciesData', () => {
  test('returns empty array for empty input', () => {
    const result = getPermissionPoliciesData({
      kind: 'role',
      name: 'testRole',
      namespace: 'default',
      selectedMembers: [],
      permissionPoliciesRows: [],
    });
    expect(result).toEqual([]);
  });

  test('correctly transforms permissionPoliciesRows into RoleBasedPolicy', () => {
    const values = {
      name: 'testRole',
      namespace: 'default',
      kind: 'role',
      selectedMembers: [],
      permissionPoliciesRows: [
        {
          plugin: 'scaffolder',
          permission: 'scaffolder-template',
          policies: [
            {
              policy: 'Read',
              effect: 'allow',
            },
          ],
        },
        {
          plugin: 'catalog',
          permission: 'catalog-entity',
          policies: [
            {
              policy: 'Read',
              effect: 'allow',
            },
            {
              policy: 'Delete',
              effect: 'allow',
            },
            {
              policy: 'Update',
              effect: 'allow',
            },
          ],
        },
      ],
    };
    const result = getPermissionPoliciesData(values);
    expect(result).toEqual([
      {
        entityReference: 'role:default/testRole',
        permission: 'scaffolder-template',
        policy: 'read',
        effect: 'allow',
      },
      {
        entityReference: 'role:default/testRole',
        permission: 'catalog-entity',
        policy: 'read',
        effect: 'allow',
      },
      {
        entityReference: 'role:default/testRole',
        permission: 'catalog-entity',
        policy: 'delete',
        effect: 'allow',
      },
      {
        entityReference: 'role:default/testRole',
        permission: 'catalog-entity',
        policy: 'update',
        effect: 'allow',
      },
    ]);
  });
});

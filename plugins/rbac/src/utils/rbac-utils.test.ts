import { GroupEntity } from '@backstage/catalog-model';

import { mockPermissionPolicies } from '../__fixtures__/mockPermissionPolicies';
import {
  getKindNamespaceName,
  getMembers,
  getMembersFromGroup,
  getPermissions,
  getPluginId,
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
    expect(getPluginId(mockPermissionPolicies, 'catalog-entity')).toBe(
      'catalog',
    );
    expect(getPluginId(mockPermissionPolicies, 'scaffolder-template')).toBe(
      'scaffolder',
    );
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
});

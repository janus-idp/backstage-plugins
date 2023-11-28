import { getMembers, getPermissions } from './rbac-utils';

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
  it('should list associated permissions for a role', () => {
    expect(getPermissions('role:default/guests', mockPolicies)).toBe(2);
  });

  it('should return number of users and groups in member references', () => {
    expect(getMembers(['user:default/xyz', 'group:default/admins'])).toBe(
      '1 User, 1 Group',
    );

    expect(
      getMembers([
        'user:default/xyz',
        'group:default/admins',
        'user:default/alice',
      ]),
    ).toBe('2 Users, 1 Group');

    expect(getMembers(['user:default/xyz'])).toBe('1 User');

    expect(getMembers(['group:default/xyz'])).toBe('1 Group');

    expect(getMembers([])).toBe('No members');
  });
});

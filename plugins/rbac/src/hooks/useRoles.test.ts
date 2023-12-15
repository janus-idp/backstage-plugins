import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { mockPolicies } from '../__fixtures__/mockPolicies';
import { useRoles } from './useRoles';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getRoles: jest.fn().mockReturnValue([
      {
        memberReferences: ['user:default/guest'],
        name: 'role:default/guests',
      },
      {
        memberReferences: ['user:default/debsmita1', 'group:default/admins'],
        name: 'role:default/rbac_admin',
      },
    ]),
    getPolicies: jest
      .fn()
      .mockReturnValueOnce(mockPolicies)
      .mockReturnValue([
        {
          entityReference: 'role:default/guests',
          permission: 'catalog-entity',
          policy: 'read',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/guests',
          permission: 'catalog.entity.create',
          policy: 'use',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'policy-entity',
          policy: 'read',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'policy-entity',
          policy: 'create',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'policy-entity',
          policy: 'delete',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'catalog-entity',
          policy: 'read',
          effect: 'allow',
        },
        {
          entityReference: 'role:default/rbac_admin',
          permission: 'catalog.entity.create',
          policy: 'use',
          effect: 'allow',
        },
      ]),
  }),
}));

describe('useRoles', () => {
  it('should return all roles irrespective of permission policies', async () => {
    const { result } = renderHook(() => useRoles());
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(2);
    });
  });

  it('should return roles', async () => {
    const { result } = renderHook(() => useRoles());
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(2);
    });
  });
});

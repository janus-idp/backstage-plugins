import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { usePermissionPolicies } from './usePermissionPolicies';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getPolicies: jest.fn().mockReturnValue([
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
    listPermissions: jest.fn().mockReturnValue([
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
    ]),
  }),
}));

describe('usePermissionPolicies', () => {
  it('should return permission policies', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(3);
    });
  });
});

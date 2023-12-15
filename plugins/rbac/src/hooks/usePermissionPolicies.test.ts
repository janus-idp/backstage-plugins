import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { mockPermissionPolicies } from '../__fixtures__/mockPermissionPolicies';
import { mockAssociatedPolicies } from '../__fixtures__/mockPolicies';
import { usePermissionPolicies } from './usePermissionPolicies';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getAssociatedPolicies: jest.fn().mockReturnValue(mockAssociatedPolicies),
    listPermissions: jest.fn().mockReturnValue(mockPermissionPolicies),
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

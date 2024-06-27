import { renderHook, waitFor } from '@testing-library/react';

import { mockConditions } from '../__fixtures__/mockConditions';
import { mockPermissionPolicies } from '../__fixtures__/mockPermissionPolicies';
import { mockAssociatedPolicies } from '../__fixtures__/mockPolicies';
import { usePermissionPolicies } from './usePermissionPolicies';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValueOnce({
      getAssociatedPolicies: jest.fn().mockReturnValue(mockAssociatedPolicies),
      listPermissions: jest.fn().mockReturnValue(mockPermissionPolicies),
      getRoleConditions: jest.fn().mockReturnValue(mockConditions),
    })
    .mockReturnValueOnce({
      getAssociatedPolicies: jest.fn().mockReturnValue(mockAssociatedPolicies),
      listPermissions: jest.fn().mockReturnValue([]),
      getRoleConditions: jest.fn().mockReturnValue([]),
    })
    .mockReturnValue({
      getAssociatedPolicies: jest
        .fn()
        .mockReturnValue({ status: '403', statusText: 'Unauthorized' }),
      listPermissions: jest.fn().mockReturnValue(mockPermissionPolicies),
      getRoleConditions: jest.fn().mockReturnValue([]),
    }),
}));

describe('usePermissionPolicies', () => {
  it('should return simple and conditional permission policies', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(5);
    });
  });

  it('should return empty permission policies when there are no permissions', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(0);
    });
  });

  it('should return an error when the fetch api call returns an error', async () => {
    const { result } = renderHook(() =>
      usePermissionPolicies('role:default/rbac_admin'),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.error).toEqual({
        message: 'Error fetching policies. Unauthorized',
        name: '403',
      });
    });
  });
});

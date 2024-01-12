import React from 'react';

import { usePermission } from '@backstage/plugin-permission-react';
import { renderInTestApp } from '@backstage/test-utils';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { PermissionsData } from '../../types';
import { PermissionsCard } from './PermissionsCard';

jest.mock('../../hooks/usePermissionPolicies', () => ({
  usePermissionPolicies: jest.fn(),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const usePermissionPoliciesMockData: PermissionsData[] = [
  {
    permission: 'policy-entity',
    plugin: 'permission',
    policyString: ['Read', ', Create', ', Delete'],
    policies: [
      {
        policy: 'read',
        effect: 'allow',
      },
      {
        policy: 'create',
        effect: 'allow',
      },
      {
        policy: 'delete',
        effect: 'allow',
      },
    ],
  },
];

const mockPermissionPolicies = usePermissionPolicies as jest.MockedFunction<
  typeof usePermissionPolicies
>;
const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('PermissionsCard', () => {
  it('should show list of Permission Policies when the data is loaded', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: usePermissionPoliciesMockData,
      retry: () => {},
      error: new Error(''),
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard entityReference="user:default/debsmita1" />,
    );
    expect(queryByText('Permission Policies (3)')).not.toBeNull();
    expect(queryByText('Read, Create, Delete')).not.toBeNull();
  });

  it('should show empty table when there are no permission policies', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      retry: () => {},
      error: new Error(''),
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard entityReference="user:default/debsmita1" />,
    );
    expect(queryByText('Permission Policies')).not.toBeNull();
    expect(queryByText('No records found')).not.toBeNull();
  });
  it('should show an error if api call fails', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      retry: () => {},
      error: { message: '404', name: 'Not Found' },
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard entityReference="user:default/debsmita1" />,
    );
    expect(
      queryByText(
        'Error: Something went wrong while fetching the permission policies',
      ),
    ).not.toBeNull();

    expect(queryByText('No records found')).not.toBeNull();
  });
  it('should show edit icon when the user is authorized to update roles', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      error: new Error(''),
      retry: () => {},
    });
    const { getByTestId } = await renderInTestApp(
      <PermissionsCard entityReference="role:default/rbac_admin" />,
    );
    expect(getByTestId('update-policies')).not.toBeNull();
  });

  it('should disable edit icon when the user is not authorized to update roles', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      error: new Error(''),
      retry: () => {},
    });
    const { queryByTestId } = await renderInTestApp(
      <PermissionsCard entityReference="role:default/rbac_admin" />,
    );
    expect(queryByTestId('disable-update-policies')).not.toBeNull();
  });
});

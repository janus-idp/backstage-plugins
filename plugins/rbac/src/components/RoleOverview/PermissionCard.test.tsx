import React from 'react';

import { renderInTestApp } from '@backstage/test-utils';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { PermissionsData } from '../../types';
import { PermissionsCard } from './PermissionsCard';

jest.mock('../../hooks/usePermissionPolicies', () => ({
  usePermissionPolicies: jest.fn(),
}));

const usePermissionPoliciesMockData: PermissionsData[] = [
  {
    permission: 'policy-entity',
    plugin: 'permission',
    policyString: new Set(['read', ', create', ', delete']),
    policies: new Set([
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
    ]),
  },
];

const mockPermissionPolicies = usePermissionPolicies as jest.MockedFunction<
  typeof usePermissionPolicies
>;

describe('PermissionsCard', () => {
  it('should show list of Permission Policies when the data is loaded', async () => {
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: usePermissionPoliciesMockData,
      retry: () => {},
      error: undefined,
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard entityReference="user:default/debsmita1" />,
    );
    expect(queryByText('Permission Policies (3)')).not.toBeNull();
    expect(queryByText('read, create, delete')).not.toBeNull();
  });

  it('should show empty table when there are no permission policies', async () => {
    mockPermissionPolicies.mockReturnValue({
      loading: false,
      data: [],
      retry: () => {},
      error: undefined,
    });
    const { queryByText } = await renderInTestApp(
      <PermissionsCard entityReference="user:default/debsmita1" />,
    );
    expect(queryByText('Permission Policies')).not.toBeNull();
    expect(queryByText('No records found')).not.toBeNull();
  });
  it('should show an error if api call fails', async () => {
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
});

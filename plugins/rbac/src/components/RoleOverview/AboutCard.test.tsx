import React from 'react';

import { renderInTestApp } from '@backstage/test-utils';

import { Role } from '@janus-idp/backstage-plugin-rbac-common';

import { useRole } from '../../hooks/useRole';
import { AboutCard } from './AboutCard';

jest.mock('../../hooks/useRole', () => ({
  useRole: jest.fn(),
}));

const mockRole: Role = {
  name: 'role:default/rbac-admin',
  memberReferences: ['user:default/tom', 'group:default/performance-dev-team'],
  metadata: {
    source: 'rest',
    description: 'performance dev team',
    lastModified: '2024-04-04T14:25:53.000Z',
    modifiedBy: 'user:default/tim',
  },
};

const mockRoleWithoutDescription: Role = {
  name: 'role:default/rbac-admin',
  memberReferences: ['user:default/tom', 'group:default/performance-dev-team'],
  metadata: {
    source: 'rest',
    description: undefined,
  },
};

const mockUseRole = useRole as jest.MockedFunction<typeof useRole>;

describe('AboutCard', () => {
  it('should show role metadata information', async () => {
    mockUseRole.mockReturnValue({
      loading: false,
      role: mockRole,
      roleError: {
        name: '',
        message: '',
      },
    });
    const { queryByText } = await renderInTestApp(
      <AboutCard roleName="role:default/rbac_admin" />,
    );
    expect(queryByText('About')).not.toBeNull();
    expect(queryByText('performance dev team')).not.toBeNull();
    expect(queryByText('user:default/tim')).not.toBeNull();
    expect(queryByText('4 Apr 2024, 14:25')).not.toBeNull();
  });

  it('should display stub, when role metadata is absent', async () => {
    mockUseRole.mockReturnValue({
      loading: false,
      role: mockRoleWithoutDescription,
      roleError: {
        name: '',
        message: '',
      },
    });
    const { queryByText, queryAllByText } = await renderInTestApp(
      <AboutCard roleName="role:default/rbac_admin" />,
    );
    expect(queryByText('About')).not.toBeNull();
    expect(queryByText('No description')).not.toBeNull();
    expect(queryAllByText('No information').length).toEqual(2);
  });

  it('should show an error if api call fails', async () => {
    mockUseRole.mockReturnValue({
      loading: false,
      role: mockRole,
      roleError: {
        name: 'Role not found',
        message: 'Role not found',
      },
    });
    const { queryByText } = await renderInTestApp(
      <AboutCard roleName="role:default/rbac_admin" />,
    );
    expect(
      queryByText('Error: Something went wrong while fetching role'),
    ).not.toBeNull();
    expect(queryByText('Role not found')).not.toBeNull();
  });
});

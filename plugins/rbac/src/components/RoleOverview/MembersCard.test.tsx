import React from 'react';

import { usePermission } from '@backstage/plugin-permission-react';
import { renderInTestApp } from '@backstage/test-utils';

import { useMembers } from '../../hooks/useMembers';
import { MembersData } from '../../types';
import { MembersCard } from './MembersCard';

jest.mock('../../hooks/useMembers', () => ({
  useMembers: jest.fn(),
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const useMembersMockData: MembersData[] = [
  {
    name: 'Amelia Park',
    type: 'User',
    ref: {
      namespace: 'default',
      kind: 'user',
      name: 'amelia.park',
    },
    members: 0,
  },
  {
    name: 'Calum Leavy',
    type: 'User',
    ref: {
      namespace: 'default',
      kind: 'user',
      name: 'calum.leavy',
    },
    members: 0,
  },
  {
    name: 'Team B',
    type: 'Group',
    ref: {
      namespace: 'default',
      kind: 'group',
      name: 'team-b',
    },
    members: 5,
  },
  {
    name: 'Team C',
    type: 'Group',
    ref: {
      namespace: 'default',
      kind: 'group',
      name: 'team-c',
    },
    members: 5,
  },
];

const mockMembers = useMembers as jest.MockedFunction<typeof useMembers>;
const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

describe('MembersCard', () => {
  it('should show list of Users and groups associated with the role when the data is loaded', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockMembers.mockReturnValue({
      loading: false,
      data: useMembersMockData,
      error: undefined,
      retry: () => {},
    });
    const { queryByText } = await renderInTestApp(
      <MembersCard roleName="role:default/rbac_admin" />,
    );
    expect(queryByText('Users and groups (2 users, 2 groups)')).not.toBeNull();
    expect(queryByText('Calum Leavy')).not.toBeNull();
    expect(queryByText('Amelia Park')).not.toBeNull();
    expect(queryByText('Team B')).not.toBeNull();
  });

  it('should show empty table when there are no users and groups', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockMembers.mockReturnValue({
      loading: false,
      data: [],
      error: undefined,
      retry: () => {},
    });
    const { queryByText } = await renderInTestApp(
      <MembersCard roleName="role:default/rbac_admin" />,
    );
    expect(queryByText('Users and groups')).not.toBeNull();
    expect(queryByText('No records found')).not.toBeNull();
  });

  it('should show an error if api call fails', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockMembers.mockReturnValue({
      loading: false,
      data: [],
      error: { message: 'xyz' },
      retry: () => {},
    });
    const { queryByText } = await renderInTestApp(
      <MembersCard roleName="role:default/rbac_admin" />,
    );
    expect(
      queryByText(
        'Error: Something went wrong while fetching the users and groups',
      ),
    ).not.toBeNull();

    expect(queryByText('No records found')).not.toBeNull();
  });

  it('should show edit icon when the user is authorized to update roles', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockMembers.mockReturnValue({
      loading: false,
      data: useMembersMockData,
      error: undefined,
      retry: () => {},
    });
    const { getByTestId } = await renderInTestApp(
      <MembersCard roleName="role:default/rbac_admin" />,
    );
    expect(getByTestId('update-members')).not.toBeNull();
  });

  it('should disable edit icon when the user is not authorized to update roles', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });
    mockMembers.mockReturnValue({
      loading: false,
      data: useMembersMockData,
      error: undefined,
      retry: () => {},
    });
    const { queryByTestId } = await renderInTestApp(
      <MembersCard roleName="role:default/rbac_admin" />,
    );
    expect(queryByTestId('disable-update-members')).not.toBeNull();
  });
});

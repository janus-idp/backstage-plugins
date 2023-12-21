import React from 'react';

import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import { renderInTestApp } from '@backstage/test-utils';

import { useRoles } from '../../hooks/useRoles';
import { RolesData } from '../../types';
import { RolesList } from './RolesList';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
  RequirePermission: jest.fn(),
}));

jest.mock('../../hooks/useRoles', () => ({
  useRoles: jest.fn(),
}));

const useRolesMockData: RolesData[] = [
  {
    name: 'role:default/guests',
    description: '-',
    members: ['user:default/xyz'],
    permissions: 2,
    modifiedBy: '-',
    lastModified: '-',
    actionsPermissionResults: {
      delete: { allowed: true, loading: false },
      edit: { allowed: true, loading: false },
    },
  },
  {
    name: 'role:default/rbac_admin',
    description: '-',
    members: ['user:default/xyz', 'group:default/hkhkh'],
    permissions: 4,
    modifiedBy: '-',
    lastModified: '-',
    actionsPermissionResults: {
      delete: { allowed: true, loading: false },
      edit: { allowed: true, loading: false },
    },
  },
];

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

const mockUseRoles = useRoles as jest.MockedFunction<typeof useRoles>;

const RequirePermissionMock = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

describe('RolesList', () => {
  it('should show list of roles when the roles are loaded', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      retry: jest.fn(),
      createRoleAllowed: false,
    });
    const { queryByText } = await renderInTestApp(<RolesList />);
    expect(queryByText('All roles (2)')).not.toBeNull();
    expect(queryByText('role:default/guests')).not.toBeNull();
    expect(queryByText('role:default/rbac_admin')).not.toBeNull();
    expect(queryByText('1 user, 1 group')).not.toBeNull();
  });

  it('should show empty table when there are no roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: [],
      retry: jest.fn(),
      createRoleAllowed: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);
    expect(getByTestId('roles-table-empty')).not.toBeNull();
  });

  it('should show delete icon if user is authorized to delete roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission
      .mockReturnValueOnce({ loading: false, allowed: true })
      .mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      retry: jest.fn(),
      createRoleAllowed: false,
    });
    const { getAllByTestId, getByText } = await renderInTestApp(<RolesList />);
    expect(getAllByTestId('delete-role')).not.toBeNull();
    expect(getByText('Actions')).not.toBeNull();
  });

  it('should show disabled delete icon if user is not authorized to delete roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission
      .mockReturnValueOnce({ loading: false, allowed: true })
      .mockReturnValue({ loading: false, allowed: false });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: [
        {
          ...useRolesMockData[0],
          actionsPermissionResults: {
            delete: { allowed: false, loading: false },
            edit: { allowed: true, loading: false },
          },
        },
        {
          ...useRolesMockData[0],
          actionsPermissionResults: {
            delete: { allowed: false, loading: true },
            edit: { allowed: true, loading: false },
          },
        },
      ],
      retry: jest.fn(),
      createRoleAllowed: false,
    });
    const { getAllByTestId } = await renderInTestApp(<RolesList />);
    expect(getAllByTestId('disable-delete-role')).not.toBeNull();
    expect(getAllByTestId('update-role')).not.toBeNull();
  });

  it('should show disabled edit icon if user is not authorized to update roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission
      .mockReturnValueOnce({ loading: false, allowed: true })
      .mockReturnValue({ loading: false, allowed: false });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: [
        {
          ...useRolesMockData[0],
          actionsPermissionResults: {
            delete: { allowed: true, loading: false },
            edit: { allowed: false, loading: false },
          },
        },
        {
          ...useRolesMockData[0],
          actionsPermissionResults: {
            delete: { allowed: true, loading: true },
            edit: { allowed: false, loading: false },
          },
        },
      ],
      retry: jest.fn(),
      createRoleAllowed: true,
    });
    const { getAllByTestId } = await renderInTestApp(<RolesList />);
    expect(getAllByTestId('disable-update-role')).not.toBeNull();
    expect(getAllByTestId('delete-role')).not.toBeNull();
  });

  it('should disable create button if user is not authorized to create roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      retry: jest.fn(),
      createRoleAllowed: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);

    expect(getByTestId('create-role').getAttribute('aria-disabled')).toEqual(
      'true',
    );
  });

  it('should enable create button if user is authorized to create roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      retry: jest.fn(),
      createRoleAllowed: true,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);

    expect(getByTestId('create-role').getAttribute('aria-disabled')).toEqual(
      'false',
    );
  });
});

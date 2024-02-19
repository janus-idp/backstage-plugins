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
      error: {
        rolesError: '',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
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
      error: {
        rolesError: '',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId, queryByText } = await renderInTestApp(<RolesList />);
    expect(getByTestId('roles-table-empty')).not.toBeNull();
    expect(queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('should show delete icon if user is authorized to delete roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission
      .mockReturnValueOnce({ loading: false, allowed: true })
      .mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId, getByText } = await renderInTestApp(<RolesList />);
    expect(getByTestId('delete-role-role:default/guests')).not.toBeNull();
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
          ...useRolesMockData[1],
          actionsPermissionResults: {
            delete: { allowed: false, loading: true },
            edit: { allowed: true, loading: false },
          },
        },
      ],
      error: {
        rolesError: '',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);
    expect(
      getByTestId('disable-delete-role-role:default/guests'),
    ).not.toBeNull();
    expect(getByTestId('update-role-role:default/guests')).not.toBeNull();
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
          ...useRolesMockData[1],
          actionsPermissionResults: {
            delete: { allowed: true, loading: true },
            edit: { allowed: false, loading: false },
          },
        },
      ],
      error: {
        rolesError: '',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: true,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);
    expect(
      getByTestId('disable-update-role-role:default/guests'),
    ).not.toBeNull();
    expect(getByTestId('delete-role-role:default/rbac_admin')).not.toBeNull();
  });

  it('should disable create button if user is not authorized to create roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
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
      error: {
        rolesError: '',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: true,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);

    expect(getByTestId('create-role').getAttribute('aria-disabled')).toEqual(
      'false',
    );
  });

  it('should show warning alert if user is not authorized to create roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: false,
      data: useRolesMockData,
      error: {
        rolesError: '',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });
    const { getByTestId } = await renderInTestApp(<RolesList />);

    expect(getByTestId('create-role-warning')).not.toBeNull();
  });

  it('should show error message when there is an error fetching the roles', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: true,
      data: [],
      error: {
        rolesError: 'Something went wrong',
        policiesError: '',
      },
      retry: { roleRetry: jest.fn(), policiesRetry: jest.fn() },
      createRoleAllowed: false,
      createRoleLoading: false,
    });

    const { queryByText } = await renderInTestApp(<RolesList />);
    expect(queryByText('Something went wrong')).toBeInTheDocument();
  });
});

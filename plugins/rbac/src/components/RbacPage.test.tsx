import React from 'react';

import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import { renderInTestApp } from '@backstage/test-utils';

import { screen } from '@testing-library/react';

import { useRoles } from '../hooks/useRoles';
import { RbacPage } from './RbacPage';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
  RequirePermission: jest.fn(),
}));

jest.mock('../hooks/useRoles', () => ({
  useRoles: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

const mockUseRoles = useRoles as jest.MockedFunction<typeof useRoles>;

const RequirePermissionMock = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

describe('RbacPage', () => {
  it('should render if authorized', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseRoles.mockReturnValue({
      loading: true,
      data: [],
      retry: jest.fn(),
      createRoleAllowed: false,
    });
    await renderInTestApp(<RbacPage />);
    expect(screen.getByText('Administration')).toBeInTheDocument();
  });

  it('should not render if not authorized', async () => {
    RequirePermissionMock.mockImplementation(_props => <>Not Found</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    await renderInTestApp(<RbacPage />);
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('should not render if loading', async () => {
    RequirePermissionMock.mockImplementation(_props => null);
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    const { queryByText } = await renderInTestApp(<RbacPage />);
    expect(queryByText('Not Found')).not.toBeInTheDocument();
    expect(queryByText('Administration')).not.toBeInTheDocument();
  });
});

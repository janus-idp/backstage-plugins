import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { RequirePermission } from '@backstage/plugin-permission-react';

import { render, screen } from '@testing-library/react';

import { Router } from './Router';

jest.mock('./RbacPage', () => ({
  RbacPage: () => <div>RBAC</div>,
}));

jest.mock('./RoleOverview/RoleOverviewPage', () => ({
  RoleOverviewPage: () => <div>Role</div>,
}));

jest.mock('./CreateRole/CreateRolePage', () => ({
  CreateRolePage: () => <div>CreateRole</div>,
}));

jest.mock('./CreateRole/EditRolePage', () => ({
  EditRolePage: () => <div>EditRole</div>,
}));

jest.mock('@backstage/plugin-permission-react', () => ({
  RequirePermission: jest
    .fn()
    .mockImplementation(({ permission, resourceRef, children }) => (
      <div>
        {permission + ' ' + resourceRef}
        {children}
      </div>
    )),
}));

const mockedPrequirePermission = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

describe('Router component', () => {
  it('renders RbacPage when path is "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Router />
      </MemoryRouter>,
    );
    expect(screen.queryByText('RBAC')).toBeInTheDocument();
  });

  it('renders RoleOverviewPage when path matches roleRouteRef', () => {
    render(
      <MemoryRouter initialEntries={['/roles/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Role')).toBeInTheDocument();
  });

  it('renders CreateRolePage with the right permissions when path matches createRoleRouteRef', () => {
    render(
      <MemoryRouter initialEntries={['/role/new']}>
        <Router />
      </MemoryRouter>,
    );
    expect(mockedPrequirePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: expect.objectContaining({ name: 'policy.entity.create' }),
        resourceRef: expect.stringContaining('policy-entity'),
      }),
      expect.anything(),
    );
    expect(screen.queryByText('CreateRole')).toBeInTheDocument();
  });

  it('renders EditRolePage with the right permissions when path matches editRoleRouteRef', () => {
    render(
      <MemoryRouter initialEntries={['/role/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(mockedPrequirePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: expect.objectContaining({ name: 'policy.entity.update' }),
        resourceRef: expect.stringContaining('policy-entity'),
      }),
      expect.anything(),
    );
    expect(screen.queryByText('EditRole')).toBeInTheDocument();
  });
});

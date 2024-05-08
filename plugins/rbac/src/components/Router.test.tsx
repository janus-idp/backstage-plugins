import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { RequirePermission } from '@backstage/plugin-permission-react';

import { render, screen } from '@testing-library/react';

import { Router } from './Router';

const configMock = {
  getOptionalBoolean: jest.fn(() => true),
};

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(() => configMock),
}));

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
        {`${permission} ${resourceRef}`}
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

  it(`should not render RbacPage when path is "/", when plugin is disabled`, () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/']}>
        <Router />
      </MemoryRouter>,
    );
    expect(screen.queryByText('RBAC')).not.toBeInTheDocument();
  });

  it('renders RoleOverviewPage when path matches roleRouteRef', () => {
    render(
      <MemoryRouter initialEntries={['/roles/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Role')).toBeInTheDocument();
  });

  it('should not render RoleOverviewPage when path matches roleRouteRef, when plugin is disabled', () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/roles/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Role')).not.toBeInTheDocument();
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

  it('should not render CreateRolePage with the right permissions when path matches createRoleRouteRef, when plugin is disabled', () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/role/new']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('CreateRole')).not.toBeInTheDocument();
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

  it('should not render EditRolePage with the right permissions when path matches editRoleRouteRef, when plugin is disabled', () => {
    configMock.getOptionalBoolean.mockReturnValueOnce(false);
    render(
      <MemoryRouter initialEntries={['/role/user/testns/testname']}>
        <Router />
      </MemoryRouter>,
    );

    expect(screen.queryByText('EditRole')).not.toBeInTheDocument();
  });
});

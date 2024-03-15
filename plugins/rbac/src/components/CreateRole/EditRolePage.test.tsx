import React from 'react';
import { useParams } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import { usePermissionPolicies } from '../../hooks/usePermissionPolicies';
import { useSelectedMembers } from '../../hooks/useSelectedMembers';
import { PermissionsData } from '../../types';
import { EditRolePage } from './EditRolePage';

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

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));
jest.mock('@backstage/core-components', () => ({
  useQueryParamState: jest.fn(),
}));
jest.mock('../../hooks/useSelectedMembers', () => ({
  useSelectedMembers: jest.fn(),
}));
jest.mock('../../hooks/usePermissionPolicies', () => ({
  usePermissionPolicies: jest.fn(),
}));

jest.mock('./RoleForm', () => ({
  RoleForm: () => <div>RoleForm</div>,
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

jest.mock('@backstage/core-components', () => ({
  useQueryParamState: () => ['roleName', jest.fn()],
  Progress: () => <div>MockedProgressComponent</div>,
  ErrorPage: () => <div>MockedErrorPageComponent</div>,
  Page: jest.fn().mockImplementation(({ children }) => (
    <div data-testid="mockPage">
      Edit Role Page
      {children}
    </div>
  )),
  Header: jest.fn().mockImplementation(({ title, type, children }) => (
    <div>
      {title + ' ' + type}
      {children}
    </div>
  )),
  Content: jest
    .fn()
    .mockImplementation(({ children }) => <div>{children}</div>),
}));

const useParamsMock = useParams as jest.MockedFunction<typeof useParams>;
const useSelectedMembersMock = useSelectedMembers as jest.MockedFunction<
  typeof useSelectedMembers
>;
const usePermissionPoliciesMock = usePermissionPolicies as jest.MockedFunction<
  typeof usePermissionPolicies
>;

beforeEach(() => {
  useParamsMock.mockReturnValue({
    roleName: 'testRole',
    roleNamespace: 'testNamespace',
    roleKind: 'testKind',
  });

  usePermissionPoliciesMock.mockReturnValue({
    loading: false,
    data: usePermissionPoliciesMockData,
    retry: { policiesRetry: jest.fn(), permissionPoliciesRetry: jest.fn() },
    error: new Error(''),
  });

  usePermissionPoliciesMock.mockClear();
});

describe('EditRolePage', () => {
  it('renders without crashing', () => {
    useSelectedMembersMock.mockReturnValue({
      selectedMembers: [],
      members: [],
      role: {
        name: 'testRole',
        memberReferences: [],
      },
      loading: false,
      roleError: { name: '', message: '' },
      membersError: new Error(''),
    });
    render(<EditRolePage />);
    expect(screen.getByText('Edit Role Page')).toBeInTheDocument();
    expect(screen.queryByText('RoleForm')).toBeInTheDocument();
  });

  it('shows progress indicator when loading', () => {
    useSelectedMembersMock.mockReturnValueOnce({
      loading: true,
      members: [],
      selectedMembers: [],
      role: undefined,
      membersError: { name: '', message: '' },
      roleError: { name: '', message: '' },
    });
    render(<EditRolePage />);
    expect(screen.queryByText('MockedProgressComponent')).toBeInTheDocument();
  });

  it('shows error page when there is a role error', () => {
    useSelectedMembersMock.mockReturnValueOnce({
      roleError: { name: 'Error', message: 'Error Message' },
      members: [],
      selectedMembers: [],
      role: undefined,
      membersError: { name: 'Error', message: 'Error Message' },
      loading: false,
    });
    render(<EditRolePage />);
    expect(screen.queryByText('MockedErrorPageComponent')).toBeInTheDocument();
  });
});

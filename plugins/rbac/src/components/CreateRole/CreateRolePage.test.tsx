import React from 'react';
import { useAsync } from 'react-use';

import { Content, Header, Page } from '@backstage/core-components';
import { RequirePermission } from '@backstage/plugin-permission-react';

import { render, screen } from '@testing-library/react';

import { mockMembers } from '../../__fixtures__/mockMembers';
import { CreateRolePage } from './CreateRolePage';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('react-use', () => ({
  useAsync: jest.fn(),
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

const mockedPrequirePermission = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

jest.mock('@backstage/core-components', () => ({
  Page: jest.fn().mockImplementation(({ children }) => (
    <div data-testid="mockPage">
      Create Role Page
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
const mockedPage = Page as jest.MockedFunction<typeof Page>;
const mockedHeader = Header as jest.MockedFunction<typeof Header>;
const mockedContent = Content as jest.MockedFunction<typeof Content>;

const useAsyncMock = useAsync as jest.MockedFunction<typeof useAsync>;

beforeEach(() => {
  jest.mock('@backstage/core-plugin-api', () => ({
    ...jest.requireActual('@backstage/core-plugin-api'),
    useApi: jest.fn().mockReturnValue({
      getMembers: jest.fn().mockReturnValue(mockMembers),
    }),
  }));
});

describe('CreateRolePage', () => {
  it('renders the RoleForm component', async () => {
    useAsyncMock.mockReturnValueOnce({
      loading: false,
      value: mockMembers,
    });

    render(<CreateRolePage />);
    expect(mockedPrequirePermission).toHaveBeenCalledWith(
      expect.objectContaining({
        permission: expect.objectContaining({ name: 'catalog.entity.read' }),
        resourceRef: expect.stringContaining('catalog-entity'),
      }),
      expect.anything(),
    );
    expect(mockedPage).toHaveBeenCalled();
    expect(mockedHeader).toHaveBeenCalled();
    expect(mockedContent).toHaveBeenCalled();
    expect(screen.queryByText('Create Role Page')).toBeInTheDocument();
    expect(screen.queryByText('RoleForm')).toBeInTheDocument();
  });
});

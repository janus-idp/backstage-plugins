import React from 'react';

import { SidebarItem } from '@backstage/core-components';
import { ApiRef, configApiRef } from '@backstage/core-plugin-api';

import { render, screen } from '@testing-library/react';

import { rbacApiRef } from '../api/RBACBackendClient';
import { Administration } from './Administration';

let useAsyncMockResult: { loading: boolean; value?: { status: string } } = {
  loading: false,
  value: { status: 'Authorized' },
};

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockImplementation((fn: any, _deps: any) => {
    fn();
    return useAsyncMockResult;
  }),
}));

const mockGetUserAuthorization = jest.fn();

const configMock = {
  getOptionalBoolean: jest.fn(() => true),
};

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn((apiRef: ApiRef<any>) => {
    if (apiRef === rbacApiRef) {
      return {
        getUserAuthorization: mockGetUserAuthorization,
      };
    }
    if (apiRef === configApiRef) {
      return configMock;
    }
    return undefined;
  }),
}));

jest.mock('@backstage/core-components', () => ({
  SidebarItem: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="mockSidebarItem">Administration</div>
    )),
}));

const mockedSidebarItem = SidebarItem as jest.MockedFunction<
  typeof SidebarItem
>;

const mockUseApi = jest.fn(() => ({
  getUserAuthorization: mockGetUserAuthorization,
}));

const mockRbacApiRef = jest.fn();

describe('Administration component', () => {
  beforeEach(() => {
    mockGetUserAuthorization.mockClear();
    mockUseApi.mockClear();
    mockRbacApiRef.mockClear();
    mockedSidebarItem.mockClear();
  });

  it('renders Administration sidebar item if user is authorized', async () => {
    render(<Administration />);
    expect(mockedSidebarItem).toHaveBeenCalled();
    expect(screen.queryByText('Administration')).toBeInTheDocument();
    expect(mockGetUserAuthorization).toHaveBeenCalledTimes(1);
  });

  it('does not render Administration sidebar item if user is not authorized', async () => {
    useAsyncMockResult = {
      loading: false,
      value: { status: 'Unauthorized' },
    };

    render(<Administration />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(mockGetUserAuthorization).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Administration')).toBeNull();
  });

  it('does not render Administration sidebar item if user loading state is true', async () => {
    useAsyncMockResult = {
      loading: true,
      value: undefined,
    };

    render(<Administration />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(screen.queryByText('Administration')).toBeNull();
  });

  it('does not render Administration sidebar item if plugin is disabled in the configuration', async () => {
    useAsyncMockResult = {
      loading: false,
      value: { status: 'Authorized' },
    };
    configMock.getOptionalBoolean.mockReturnValueOnce(false);

    render(<Administration />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(mockGetUserAuthorization).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Administration')).toBeNull();
  });
});

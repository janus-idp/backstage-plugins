import React from 'react';
import { useAsync } from 'react-use';

import { SidebarItem } from '@backstage/core-components';

import { render, screen } from '@testing-library/react';

import { Administration } from './Administration';

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
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

const mockGetUserAuthorization = jest.fn();

const mockUseApi = jest.fn(() => ({
  getUserAuthorization: mockGetUserAuthorization,
}));

const mockRbacApiRef = jest.fn();

describe('Administration component', () => {
  beforeEach(() => {
    mockGetUserAuthorization.mockClear();
    mockUseApi.mockClear();
    (useAsync as jest.Mock).mockClear();
    mockRbacApiRef.mockClear();
    mockedSidebarItem.mockClear();
  });

  it('renders Administration sidebar item if user is authorized', async () => {
    (useAsync as jest.Mock).mockReturnValueOnce({
      loading: false,
      value: { status: 'Authorized' },
    });

    (useAsync as jest.Mock).mockImplementation(() => ({
      ...mockUseApi(),
      getUserAuthorization: mockGetUserAuthorization,
    }));

    render(<Administration />);
    expect(mockedSidebarItem).toHaveBeenCalled();
    expect(screen.queryByText('Administration')).toBeInTheDocument();
  });

  it('does not render Administration sidebar item if user is not authorized', async () => {
    (useAsync as jest.Mock).mockReturnValueOnce({
      loading: false,
      value: { status: 'Unauthorized' },
    });

    (useAsync as jest.Mock).mockImplementation(() => ({
      ...mockUseApi(),
      getUserAuthorization: mockGetUserAuthorization,
    }));

    render(<Administration />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(screen.queryByText('Administration')).toBeNull();
  });

  it('does not render Administration sidebar item if user loading state is true', async () => {
    (useAsync as jest.Mock).mockReturnValueOnce({
      loading: true,
      value: null,
    });

    (useAsync as jest.Mock).mockImplementation(() => ({
      ...mockUseApi(),
      getUserAuthorization: mockGetUserAuthorization,
    }));

    render(<Administration />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(screen.queryByText('Administration')).toBeNull();
  });
});

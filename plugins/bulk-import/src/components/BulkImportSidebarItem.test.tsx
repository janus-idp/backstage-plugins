import React from 'react';

import { SidebarItem } from '@backstage/core-components';
import { usePermission } from '@backstage/plugin-permission-react';

import { render, screen } from '@testing-library/react';

import { BulkImportSidebarItem } from './BulkImportSidebarItem';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

const configMock = {
  getOptionalBoolean: jest.fn(() => true),
};

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(() => {
    return configMock;
  }),
}));

jest.mock('@backstage/core-components', () => ({
  SidebarItem: jest
    .fn()
    .mockImplementation(() => (
      <div data-testid="mockSidebarItem">Bulk import</div>
    )),
}));

const mockedSidebarItem = SidebarItem as jest.MockedFunction<
  typeof SidebarItem
>;

const mockBulkImportApiRef = jest.fn();

describe('Administration component', () => {
  beforeEach(() => {
    mockBulkImportApiRef.mockClear();
    mockedSidebarItem.mockClear();
  });

  it('renders Bulk import sidebar item if user is authorized', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    render(<BulkImportSidebarItem />);
    expect(mockedSidebarItem).toHaveBeenCalled();
    expect(screen.queryByText('Bulk import')).toBeInTheDocument();
  });

  it('does not render Bulk import sidebar item if user is not authorized', async () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    render(<BulkImportSidebarItem />);
    expect(screen.queryByText('Bulk import')).toBeNull();
  });

  it('does not render Bulk import sidebar item if user loading state is true', async () => {
    mockUsePermission.mockReturnValue({ loading: true, allowed: false });

    render(<BulkImportSidebarItem />);
    expect(mockedSidebarItem).not.toHaveBeenCalled();
    expect(screen.queryByText('Bulk import')).toBeNull();
  });

  it('renders the Bulk import sidebar item if RBAC is disabled in the configuration', async () => {
    mockUsePermission.mockReturnValue({ loading: true, allowed: true });
    configMock.getOptionalBoolean.mockReturnValueOnce(false);

    render(<BulkImportSidebarItem />);
    expect(mockedSidebarItem).toHaveBeenCalled();
    expect(screen.queryByText('Bulk import')).toBeInTheDocument();
  });
});

import React from 'react';

import {
  RequirePermission,
  usePermission,
} from '@backstage/plugin-permission-react';
import { renderInTestApp } from '@backstage/test-utils';

import { screen } from '@testing-library/react';

import { useAddedRepositories } from '../hooks';
import { BulkImportPage } from './BulkImportPage';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
  RequirePermission: jest.fn(),
}));

jest.mock('../hooks/useAddedRepositories', () => ({
  useAddedRepositories: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

const mockUseAddedRepositories = useAddedRepositories as jest.MockedFunction<
  typeof useAddedRepositories
>;

const RequirePermissionMock = RequirePermission as jest.MockedFunction<
  typeof RequirePermission
>;

describe('BulkImport Page', () => {
  it('should render if user is authorized to access bulk import plugin', async () => {
    RequirePermissionMock.mockImplementation(props => <>{props.children}</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
    mockUseAddedRepositories.mockReturnValue({
      loaded: true,
      data: { addedRepositories: [], totalJobs: 0 },
      refetch: jest.fn(),
      error: undefined,
    });
    await renderInTestApp(<BulkImportPage />);
    expect(screen.getByText('Added repositories')).toBeInTheDocument();
  });

  it('should not render if user is not authorized to access the bulk import plugin', async () => {
    RequirePermissionMock.mockImplementation(_props => <>Not Found</>);
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    await renderInTestApp(<BulkImportPage />);
    expect(
      screen.getByText(
        'To view the added repositories, contact your administrator to give you the `bulk.import` permission.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('Added repositories')).not.toBeInTheDocument();
  });
});

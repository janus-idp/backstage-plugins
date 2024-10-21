import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAsync } from 'react-use';

import { identityApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';

import { render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { useRepositories } from '../../hooks';
import {
  mockGetImportJobs,
  mockGetOrganizations,
  mockGetRepositories,
} from '../../mocks/mockData';
import { ImportJobStatus, RepositorySelection } from '../../types';
import { AddRepositoriesTable } from './AddRepositoriesTable';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getImportAction: jest.fn(),
  }),
}));

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockReturnValue({ loading: false }),
}));

jest.mock('../../hooks', () => ({
  useRepositories: jest.fn(),
}));

class MockBulkImportApi {
  async getImportAction(
    repo: string,
    _defaultBranch: string,
  ): Promise<ImportJobStatus | Response> {
    return mockGetImportJobs.imports.find(
      i => i.repository.url === repo,
    ) as ImportJobStatus;
  }
}

const mockUseRepositories = useRepositories as jest.MockedFunction<
  typeof useRepositories
>;

const mockBulkImportApi = new MockBulkImportApi();

describe('Add Repositories Table', () => {
  const mockIdentityApi = {
    getBackstageIdentity: jest.fn(),
  };
  mockIdentityApi.getBackstageIdentity.mockResolvedValue({
    type: 'user',
    userEntityRef: 'user:default/foo',
    ownershipEntityRefs: [],
  });

  it('should show Circular progress when data is loading', async () => {
    const mockAsyncData = {
      loading: false,
      value: {
        status: null,
      },
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {},
        repositoryType: RepositorySelection.Repository,
      },
    });
    mockUseRepositories.mockReturnValue({
      loading: true,
      data: null,
      error: undefined,
    });
    const { getByText, getByTestId } = render(
      <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
        <BrowserRouter>
          <AddRepositoriesTable title="Selected repositories" />
        </BrowserRouter>
      </TestApiProvider>,
    );
    expect(getByText('Selected repositories (0)')).toBeInTheDocument();
    expect(getByTestId('repositories-table-loading')).toBeTruthy();
  });

  it('should render list of repositories', async () => {
    const mockAsyncData = {
      loading: false,
      value: {
        status: null,
      },
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
        },
        repositoryType: RepositorySelection.Repository,
      },
    });
    mockUseRepositories.mockReturnValue({
      loading: false,
      data: {
        repositories: mockGetRepositories.repositories.reduce(
          (acc, r) => ({ ...acc, [r.id]: r }),
          {},
        ),
        totalRepositories: 10,
        totalOrganizations: 0,
      },
      error: undefined,
    });
    const { getByText, getByTestId } = render(
      <TestApiProvider
        apis={[
          [identityApiRef, mockIdentityApi],
          [bulkImportApiRef, mockBulkImportApi],
        ]}
      >
        <BrowserRouter>
          <AddRepositoriesTable title="Selected repositories" />
        </BrowserRouter>
      </TestApiProvider>,
    );
    expect(getByText('Selected repositories (1)')).toBeInTheDocument();
    expect(getByTestId('repository-view')).toBeTruthy();
    expect(getByTestId('organization-view')).toBeTruthy();
    expect(getByTestId('repositories-table')).toBeTruthy();
  });

  it('should render list of organizations', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
        },
        repositoryType: RepositorySelection.Organization,
      },
    });
    mockUseRepositories.mockReturnValue({
      loading: false,
      data: {
        organizations: mockGetOrganizations.organizations.reduce(
          (acc, r) => ({ ...acc, [r.id]: r }),
          {},
        ),
        totalOrganizations: 3,
        totalRepositories: 0,
      },
      error: undefined,
    });
    const { getByText, getByTestId } = render(
      <TestApiProvider
        apis={[
          [identityApiRef, mockIdentityApi],
          [bulkImportApiRef, mockBulkImportApi],
        ]}
      >
        <BrowserRouter>
          <AddRepositoriesTable title="Selected repositories" />
        </BrowserRouter>
      </TestApiProvider>,
    );
    expect(getByText('Selected repositories (1)')).toBeInTheDocument();
    expect(getByTestId('repository-view')).toBeTruthy();
    expect(getByTestId('organization-view')).toBeTruthy();
    expect(getByTestId('organizations-table')).toBeTruthy();
  });
});

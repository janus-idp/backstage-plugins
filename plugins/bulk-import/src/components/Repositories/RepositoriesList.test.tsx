import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { identityApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';

import { render, screen } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { useAddedRepositories } from '../../hooks';
import { mockGetImportJobs } from '../../mocks/mockData';
import { RepositoriesList } from './RepositoriesList';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));

jest.mock('./RepositoriesList', () => ({
  ...jest.requireActual('./RepositoriesList'),
  useStyles: jest.fn().mockReturnValue({ empty: 'empty' }),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => () => {
    return {
      empty: 'empty',
    };
  },
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('../../hooks/useAddedRepositories', () => ({
  useAddedRepositories: jest.fn(),
}));

const mockIdentityApi = {
  getBackstageIdentity: jest
    .fn()
    .mockResolvedValue({ userEntityRef: 'user:default/testuser' }),
};

jest.mock('./RepositoriesListColumns', () => ({
  columns: [
    {
      title: 'Name',
      field: 'repoName',
      type: 'string',
    },
    {
      title: 'Repo URL',
      field: 'repoUrl',
      type: 'string',
    },
    {
      title: 'Organization',
      field: 'orgName',
      type: 'string',
    },
    {
      title: 'Status',
      field: 'catalogInfoYaml.status',
      type: 'string',
    },
    {
      title: 'Last updated',
      field: 'lastUpdated',
      type: 'string',
    },
    {
      title: 'Actions',
      field: 'actions',
      type: 'string',
    },
  ],
}));

const mockAsyncData = {
  loaded: true,
  data: mockGetImportJobs,
  totalCount: 1,
  error: undefined,
  retry: jest.fn(),
};

const mockUseAddedRepositories = useAddedRepositories as jest.MockedFunction<
  typeof useAddedRepositories
>;

describe('RepositoriesList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have an add button and an Added repositories table', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      status: null,
      setFieldValue: jest.fn(),
    });
    mockUseAddedRepositories.mockReturnValue(mockAsyncData);
    render(
      <Router>
        <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
          <RepositoriesList />
        </TestApiProvider>
      </Router>,
    );
    const addRepoButton = screen.getByText('Add');
    expect(addRepoButton).toBeInTheDocument();
    expect(
      screen.getByText('Added repositories (4)', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Repo URL')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Last updated')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render the component and display empty content when no data', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      status: null,
      setFieldValue: jest.fn(),
    });
    mockUseAddedRepositories.mockReturnValue({ ...mockAsyncData, data: [] });
    render(
      <Router>
        <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
          <RepositoriesList />
        </TestApiProvider>
      </Router>,
    );

    expect(
      screen.getByText('Added repositories (0)', { exact: false }),
    ).toBeInTheDocument();
    const emptyMessage = screen.getByTestId('added-repositories-table-empty');
    expect(emptyMessage).toBeInTheDocument();
    expect(emptyMessage).toHaveTextContent('No records found');
  });

  it('should display an alert if get import job api fails', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      status: {
        title: 'Not found',
        url: 'https://xyz',
      },
      setFieldValue: jest.fn(),
    });
    mockUseAddedRepositories.mockReturnValue({ ...mockAsyncData, data: [] });
    render(
      <Router>
        <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
          <RepositoriesList />
        </TestApiProvider>
      </Router>,
    );

    expect(
      screen.getByText('Not found https://xyz', { exact: false }),
    ).toBeInTheDocument();
  });
});

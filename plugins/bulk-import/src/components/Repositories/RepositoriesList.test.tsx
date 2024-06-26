import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAsync } from 'react-use';

import { identityApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';

import { render, screen } from '@testing-library/react';
import { useFormikContext } from 'formik';

import * as mockDataModule from '../../mocks/mockData';
import { AddRepositoriesData, RepositoryStatus } from '../../types';
import { RepositoriesList } from './RepositoriesList';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
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

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn(),
}));

jest.mock('../../mocks/mockData', () => ({
  getDataForRepositories: jest.fn(),
}));

const mockIdentityApi = {
  getBackstageIdentity: jest
    .fn()
    .mockResolvedValue({ userEntityRef: 'user:default/testuser' }),
};

const mockRepositoriesData: AddRepositoriesData[] = [
  {
    id: 5,
    repoName: 'Gingerbread',
    repoUrl: 'https://github.com/gingerbread',
    orgName: 'org/desert',
    organizationUrl: 'org/desert',
    catalogInfoYaml: {
      status: RepositoryStatus.Exists,
      prTemplate: {
        componentName: 'Gingerbread',
        entityOwner: 'user:default/testuser',
        prTitle: 'This is the pull request title',
        prDescription: 'This is the description of the pull request',
        useCodeOwnersFile: false,
        yaml: {
          kind: 'Component',
          apiVersion: 'v1',
          metadata: { name: 'Gingerbread' },
        },
      },
    },
    lastUpdated: 'Jun 24, 2024, 3:25 PM',
  },
];

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

describe('RepositoriesList', () => {
  beforeEach(() => {
    const setFieldValue = jest.fn();
    (useFormikContext as jest.Mock).mockReturnValue({
      setFieldValue,
      values: {
        repositories: {},
        repositoryType: 'repository',
      },
    });
    (useAsync as jest.Mock).mockReturnValue({
      loading: false,
      value: 'user:default/testuser',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should have an add button and an Added repositories table', async () => {
    jest.spyOn(mockDataModule, 'getDataForRepositories').mockReturnValue([]);

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
      screen.getByText('Added repositories', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Repo URL')).toBeInTheDocument();
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Last updated')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should render the component and display empty content when no data', async () => {
    jest.spyOn(mockDataModule, 'getDataForRepositories').mockReturnValue([]);

    render(
      <Router>
        <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
          <RepositoriesList />
        </TestApiProvider>
      </Router>,
    );

    const emptyMessage = screen.getByTestId('repositories-table-empty');
    expect(emptyMessage).toBeInTheDocument();
    expect(emptyMessage).toHaveTextContent('No records found');
  });

  it('should render the component and display table data', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      setFieldValue: jest.fn(),
      values: {
        repositories: mockRepositoriesData,
        repositoryType: 'repository',
      },
    });
    jest
      .spyOn(mockDataModule, 'getDataForRepositories')
      .mockReturnValue(mockRepositoriesData);

    render(
      <Router>
        <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
          <RepositoriesList />
        </TestApiProvider>
      </Router>,
    );
    expect(screen.getByText('Added repositories (1)')).toBeInTheDocument();
    expect(screen.getByText('Gingerbread')).toBeInTheDocument();
    expect(
      screen.getByText('github.com/gingerbread', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText('org/desert')).toBeInTheDocument();
    expect(screen.getByText('Exists')).toBeInTheDocument();
    expect(screen.getByText('Jun 24, 2024, 3:25 PM')).toBeInTheDocument();
  });
});

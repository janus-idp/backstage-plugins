import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { configApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { useDrawer } from '@janus-idp/shared-react';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { mockGetImportJobs, mockGetRepositories } from '../../mocks/mockData';
import { ImportJobStatus, RepositorySelection } from '../../types';
import { AddRepositories } from './AddRepositories';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));

jest.mock('./AddRepositoriesForm', () => ({
  ...jest.requireActual('./AddRepositoriesForm'),
  useStyles: jest.fn().mockReturnValue({
    body: 'body',
    approvalTool: 'approvaltool',
    approvalToolTooltip: 'approvalToolTooltip',
  }),
}));

jest.mock('@janus-idp/shared-react', () => ({
  ...jest.requireActual('@janus-idp/shared-react'),
  useDrawer: jest.fn(),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => () => {
    return {
      body: 'body',
      approvalTool: 'approvaltool',
      approvalToolTooltip: 'approvalToolTooltip',
    };
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for testing
      },
    },
  });
let queryClient: QueryClient;

class MockBulkImportApi {
  async getImportAction(
    repo: string,
    _defaultBranch: string,
  ): Promise<ImportJobStatus | Response> {
    return mockGetImportJobs.find(
      i => i.repository.url === repo,
    ) as ImportJobStatus;
  }
}

const mockBulkImportApi = new MockBulkImportApi();

const mockIdentityApi = {
  getBackstageIdentity: jest
    .fn()
    .mockResolvedValue({ userEntityRef: 'user:default/testuser' }),
};

beforeEach(() => {
  (useFormikContext as jest.Mock).mockReturnValue({
    values: {
      repositoryType: RepositorySelection.Repository,
    },
    setFieldValue: jest.fn(),
  });
  queryClient = createTestQueryClient();
});

describe('AddRepsositoriesForm', () => {
  it('should render the repositories list with the footer', async () => {
    (useDrawer as jest.Mock).mockImplementation(initial => ({
      initial,
      setOpenDrawer: jest.fn(),
      setDrawerData: jest.fn(),
    }));
    render(
      <Router>
        <TestApiProvider
          apis={[
            [identityApiRef, mockIdentityApi],
            [bulkImportApiRef, mockBulkImportApi],
            [
              configApiRef,
              new MockConfigApi({
                catalog: {
                  import: {
                    entityFilename: 'test.yaml',
                  },
                },
              }),
            ],
          ]}
        >
          <QueryClientProvider client={queryClient}>
            <AddRepositories error={null} />
          </QueryClientProvider>
        </TestApiProvider>
      </Router>,
    );
    expect(
      screen.getByText('Selected repositories (0)', { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('add-repository-footer')).toBeInTheDocument();

    expect(screen.queryByTestId('preview-pullrequest-sidebar')).toBeFalsy();
  });

  it('should show any load errors', async () => {
    (useDrawer as jest.Mock).mockReturnValue({
      openDrawer: true,
      drawerData: mockGetRepositories.repositories[0],
      setOpenDrawer: jest.fn(),
      setDrawerData: jest.fn(),
    });
    render(
      <Router>
        <TestApiProvider
          apis={[
            [identityApiRef, mockIdentityApi],
            [bulkImportApiRef, mockBulkImportApi],
            [
              configApiRef,
              new MockConfigApi({
                catalog: {
                  import: {
                    entityFilename: 'test.yaml',
                  },
                },
              }),
            ],
          ]}
        >
          <QueryClientProvider client={queryClient}>
            <AddRepositories
              error={{ message: 'error', title: 'error occurred' }}
            />
          </QueryClientProvider>
        </TestApiProvider>
      </Router>,
    );
    expect(screen.getByText('error occurred')).toBeTruthy();
    expect(
      screen.getByText('Selected repositories (0)', { exact: false }),
    ).toBeInTheDocument();
  });
});

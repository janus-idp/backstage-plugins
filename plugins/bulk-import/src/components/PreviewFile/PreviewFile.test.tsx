import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { TestApiProvider } from '@backstage/test-utils';

import { fireEvent, render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { useDrawer } from '@janus-idp/shared-react';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import {
  mockGetImportJobs,
  mockGetOrganizations,
  mockGetRepositories,
} from '../../mocks/mockData';
import { ImportJobStatus, RepositorySelection } from '../../types';
import { PreviewFile } from './PreviewFile';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

jest.mock('@janus-idp/shared-react', () => ({
  ...jest.requireActual('@janus-idp/shared-react'),
  useDrawer: jest.fn(),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => () => {
    return {
      paper: 'paper',
      createButton: 'create',
      footer: 'footer',
      header: 'header',
      body: 'body',
    };
  },
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

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));
const setState = jest.fn();
const setOpenDrawer = jest.fn();
const setDrawerData = jest.fn();

beforeEach(() => {
  (useState as jest.Mock).mockImplementation(initial => [initial, setState]);
  (useDrawer as jest.Mock).mockImplementation(initial => ({
    initial,
    setOpenDrawer,
    setDrawerData,
  }));
});

const mockBulkImportApi = new MockBulkImportApi();

describe('Preview File', () => {
  it('should render pull request preview for the selected repository', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositoryType: RepositorySelection.Repository,
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
        },
      },
    });
    const { queryByTestId, getByText } = render(
      <TestApiProvider apis={[[bulkImportApiRef, mockBulkImportApi]]}>
        <BrowserRouter>
          <PreviewFile data={mockGetRepositories.repositories[0]} />
        </BrowserRouter>
      </TestApiProvider>,
    );
    expect(getByText(/Preview File/i)).toBeInTheDocument();
    expect(queryByTestId('preview-file')).toBeInTheDocument();
    const previewButton = getByText(/Preview File/i);
    fireEvent.click(previewButton);
    expect(setOpenDrawer).toHaveBeenCalledWith(true);
  });

  it('should render pull requests preview for the selected repositories in the organization view', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositoryType: RepositorySelection.Organization,
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
          'org/dessert/Donut': mockGetRepositories.repositories[1],
        },
      },
    });
    const { queryByTestId, getByText } = render(
      <TestApiProvider apis={[[bulkImportApiRef, mockBulkImportApi]]}>
        <BrowserRouter>
          <PreviewFile
            data={{
              ...mockGetOrganizations.organizations[0],
              selectedRepositories: {
                'org/dessert/cupcake': mockGetRepositories.repositories[0],
                'org/dessert/donut': mockGetRepositories.repositories[1],
              },
            }}
          />
        </BrowserRouter>
      </TestApiProvider>,
    );
    expect(getByText(/Preview files/i)).toBeInTheDocument();
    expect(queryByTestId('preview-files')).toBeInTheDocument();
    const previewButton = getByText(/Preview files/i);
    fireEvent.click(previewButton);
    expect(setOpenDrawer).toHaveBeenCalledWith(true);
  });

  it('should show the status of the catalog-info', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositoryType: RepositorySelection.Organization,
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
          'org/dessert/donut': mockGetRepositories.repositories[1],
        },
      },
      status: {
        errors: {
          'org/dessert/cupcake': {
            catalogEntityName: 'cupcake',
            error: {
              message:
                'Git Repository is empty. - https://docs.github.com/rest/git/refs#get-a-reference',
              status: 'PR_ERROR',
            },
            repository: mockGetRepositories?.repositories?.[0],
          },
        },
      },
    });
    const { queryByTestId, getByText } = render(
      <TestApiProvider apis={[[bulkImportApiRef, mockBulkImportApi]]}>
        <BrowserRouter>
          <PreviewFile
            data={{
              ...mockGetOrganizations.organizations[0],
              selectedRepositories: {
                'org/dessert/cupcake': mockGetRepositories.repositories[0],
                'org/dessert/donut': mockGetRepositories.repositories[1],
              },
            }}
          />
        </BrowserRouter>
      </TestApiProvider>,
    );
    expect(getByText(/Failed to create PR/i)).toBeInTheDocument();
    expect(queryByTestId('failed')).toBeInTheDocument();
    const editButton = getByText(/Edit/i);
    fireEvent.click(editButton);
    expect(setOpenDrawer).toHaveBeenCalledWith(true);
  });
});

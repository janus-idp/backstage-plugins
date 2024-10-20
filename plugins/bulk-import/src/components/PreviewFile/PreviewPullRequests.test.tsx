import React, { useState } from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { mockGetImportJobs, mockGetRepositories } from '../../mocks/mockData';
import { mockEntities } from '../../mocks/mockEntities';
import { ApprovalTool, ImportJobStatus, RepositoryStatus } from '../../types';
import { getPRTemplate } from '../../utils/repository-utils';
import { PreviewPullRequests } from './PreviewPullRequests';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: () => () => {
    return {
      previewCard: 'previewcard',
      previewCardContent: 'previewcardcontent',
    };
  },
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockReturnValue({ loading: false }),
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

const setState = jest.fn();

beforeEach(() => {
  (useState as jest.Mock).mockImplementation(initial => [initial, setState]);
});

const mockCatalogApi: Partial<CatalogApi> = {
  getEntities: jest.fn().mockReturnValue(mockEntities),
};

const mockBulkImportApi = new MockBulkImportApi();

describe('Preview Pull Requests', () => {
  it('should render the pull request preview without the tab view when only one repository from the an org is selected', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
        },
        approvalTool: ApprovalTool.Git,
      },
    });

    const { getByText, getByPlaceholderText, queryByRole } = render(
      <TestApiProvider
        apis={[
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
          [catalogApiRef, mockCatalogApi],
        ]}
      >
        <PreviewPullRequests
          repositories={[mockGetRepositories.repositories[0]]}
          pullRequest={{
            'org/dessert/cupcake': getPRTemplate(
              'org/dessert/cupcake',
              'org/dessert',
              'user:default/guest',
              'https://localhost:3001',
              'https://github.com/org/dessert/cupcake',
              'main',
            ),
          }}
          setFormErrors={() => jest.fn()}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    expect(queryByRole('tablist')).not.toBeInTheDocument();
    expect(getByText(/Pull request details/i)).toBeInTheDocument();
    expect(getByText(/Preview pull request/i)).toBeInTheDocument();
    expect(getByText(/Preview entities/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/groups and users/)).toBeInTheDocument();
  });

  it('should render a tab view of pull request preview when more than one repository from the an org are selected', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
          'org/dessert/donut': mockGetRepositories.repositories[1],
        },
        approvalTool: ApprovalTool.Git,
      },
    });

    const { getByText, getByPlaceholderText, getByRole } = render(
      <TestApiProvider
        apis={[
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
          [catalogApiRef, mockCatalogApi],
        ]}
      >
        <PreviewPullRequests
          repositories={[
            mockGetRepositories.repositories[0],
            mockGetRepositories.repositories[1],
          ]}
          pullRequest={{
            'org/dessert/cupcake': getPRTemplate(
              'org/dessert/cupcake',
              'org/dessert',
              'user:default/guest',
              'https://localhost:3001',
              'https://github.com/org/dessert/cupcake',
              'main',
            ),
            'org/dessert/donut': getPRTemplate(
              'org/dessert/donut',
              'org/dessert',
              'user:default/guest',
              'https://localhost:3001',
              'https://github.com/org/dessert/donut',
              'main',
            ),
          }}
          setFormErrors={() => jest.fn()}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    expect(getByRole('tablist')).toBeInTheDocument();
    expect(getByText('cupcake')).toBeInTheDocument();
    expect(getByText('donut')).toBeInTheDocument();
    expect(getByText(/Pull request details/i)).toBeInTheDocument();
    expect(getByText(/Preview pull request/i)).toBeInTheDocument();
    expect(getByText(/Preview entities/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/groups and users/)).toBeInTheDocument();
  });

  it('should show error icon against the tab name when the PR fails', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      status: {
        errors: {
          'org/dessert/cupcake': {
            repository: {
              name: mockGetRepositories.repositories[0].name,
              organization: mockGetRepositories.repositories[0].orgName,
            },
            catalogEntityName: mockGetRepositories.repositories[0].name,
            error: {
              message: [RepositoryStatus.CODEOWNERS_FILE_NOT_FOUND_IN_REPO],
            },
          },
        },
        infos: {
          'org/dessert/donut': {
            repository: {
              name: mockGetRepositories.repositories[1].name,
              organization: mockGetRepositories.repositories[1].orgName,
            },
            catalogEntityName: mockGetRepositories.repositories[1].name,
            error: {
              message: [RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO],
            },
          },
        },
      },
      values: {
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
          'org/dessert/donut': mockGetRepositories.repositories[1],
        },
        approvalTool: ApprovalTool.Git,
      },
    });

    const { getByTestId } = render(
      <TestApiProvider
        apis={[
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
          [catalogApiRef, mockCatalogApi],
        ]}
      >
        <PreviewPullRequests
          repositories={[
            mockGetRepositories.repositories[0],
            mockGetRepositories.repositories[1],
          ]}
          pullRequest={{
            'org/dessert/cupcake': getPRTemplate(
              'org/dessert/cupcake',
              'org/dessert',
              'user:default/guest',
              'https://localhost:3001',
              'https://github.com/org/dessert/cupcake',
              'main',
            ),
            'org/dessert/donut': getPRTemplate(
              'org/dessert/donut',
              'org/dessert',
              'user:default/guest',
              'https://localhost:3001',
              'https://github.com/org/dessert/donut',
              'main',
            ),
          }}
          setFormErrors={() => jest.fn()}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    expect(getByTestId('pr-creation-failed')).toBeTruthy();
    expect(getByTestId('info-message')).toBeTruthy();
  });
});

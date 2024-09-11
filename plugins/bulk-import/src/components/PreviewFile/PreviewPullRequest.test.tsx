import React, { useState } from 'react';
import { useAsync } from 'react-use';

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
import { PreviewPullRequest } from './PreviewPullRequest';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
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
    return mockGetImportJobs.find(
      i => i.repository.url === repo,
    ) as ImportJobStatus;
  }
}

const setState = jest.fn();

beforeEach(() => {
  (useState as jest.Mock).mockImplementation(initial => [initial, setState]);
});

const mockBulkImportApi = new MockBulkImportApi();

const mockCatalogApi: Partial<CatalogApi> = {
  getEntities: jest.fn().mockReturnValue(mockEntities),
};

describe('Preview Pull Request', () => {
  it('should show warning panel with error if PR fails', async () => {
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
      },
      values: {
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
        },
        approvalTool: ApprovalTool.Git,
      },
    });

    const { getByText } = render(
      <TestApiProvider
        apis={[
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
          [bulkImportApiRef, mockBulkImportApi],
        ]}
      >
        <PreviewPullRequest
          repoId="org/dessert/cupcake"
          repoUrl="https://github.com/org/dessert/cupcake"
          repoBranch="main"
          pullRequest={{
            'org/dessert/cupcake': getPRTemplate(
              'org/dessert/cupcake',
              'org/dessert',
              'user:default/guest',
              'https://localhost:3001',
              'https://github.com/org/dessert/cupcake',
            ),
          }}
          setFormErrors={() => jest.fn()}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    expect(getByText(/Failed to create PR/)).toBeInTheDocument();
    expect(
      getByText(
        /CODEOWNERS file is missing from the repository. Add a CODEOWNERS file to create a new PR./,
      ),
    ).toBeInTheDocument();
  });

  it('should show info to display important message', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      status: {
        infos: {
          'org/dessert/cupcake': {
            repository: {
              name: mockGetRepositories.repositories[0].name,
              organization: mockGetRepositories.repositories[0].orgName,
            },
            catalogEntityName: mockGetRepositories.repositories[0].name,
            error: {
              message: [RepositoryStatus.CATALOG_INFO_FILE_EXISTS_IN_REPO],
            },
          },
        },
      },
      values: {
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
        },
        approvalTool: ApprovalTool.Git,
      },
    });

    const { getByText } = render(
      <TestApiProvider
        apis={[
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
          [bulkImportApiRef, mockBulkImportApi],
        ]}
      >
        <PreviewPullRequest
          repoId="org/dessert/cupcake"
          repoUrl="https://github.com/org/dessert/cupcake"
          repoBranch="main"
          pullRequest={{
            'org/dessert/cupcake': getPRTemplate(
              'org/dessert/cupcake',
              'org/dessert',
              'user:default/guest',
              'https://localhost:3001',
              'https://github.com/org/dessert/cupcake',
            ),
          }}
          setFormErrors={() => jest.fn()}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    expect(
      getByText(
        /Since catalog-info.yaml already exists in the repository, no new PR will be created. However, the entity will still be registered in the catalog page./,
      ),
    ).toBeInTheDocument();
  });

  it('should show PR link in the info if the job has a PR waiting for approval', async () => {
    (useAsync as jest.Mock).mockReturnValue({
      loading: false,
      value: {
        github: {
          pullRequest: {
            url: 'https://github.com/org/dessert/cupcake',
          },
        },
      },
    });
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      status: {},
      values: {
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
        },
        approvalTool: ApprovalTool.Git,
      },
    });

    const { getByTestId } = render(
      <TestApiProvider
        apis={[
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
          [bulkImportApiRef, mockBulkImportApi],
        ]}
      >
        <PreviewPullRequest
          repoId="org/dessert/cupcake"
          repoUrl="https://github.com/org/dessert/cupcake"
          repoBranch="main"
          pullRequest={{
            'org/dessert/cupcake': getPRTemplate(
              'org/dessert/cupcake',
              'org/dessert',
              'user:default/guest',
              'https://localhost:3001',
              'https://github.com/org/dessert/cupcake',
            ),
          }}
          setFormErrors={() => jest.fn()}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    expect(getByTestId('pull-request-info')).toBeInTheDocument();
  });
});

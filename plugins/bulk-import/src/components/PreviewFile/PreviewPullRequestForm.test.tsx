import React, { useState } from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { fireEvent, render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { mockGetImportJobs, mockGetRepositories } from '../../mocks/mockData';
import { mockEntities } from '../../mocks/mockEntities';
import { ApprovalTool, ImportJobStatus } from '../../types';
import { getPRTemplate } from '../../utils/repository-utils';
import { PreviewPullRequestForm } from './PreviewPullRequestForm';

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

const mockBulkImportApi = new MockBulkImportApi();

const mockCatalogApi: Partial<CatalogApi> = {
  getEntities: jest.fn().mockReturnValue(mockEntities),
};

describe('Preview Pull Request Form', () => {
  // Enable this test when Service Now approval tool is supported
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should render the servicenow ticket preview', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
        },
        approvalTool: ApprovalTool.ServiceNow,
      },
    });

    const { getByText, getByPlaceholderText } = render(
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
        <PreviewPullRequestForm
          repoId="org/dessert/cupcake"
          repoUrl="https://github.com/org/dessert/cupcake"
          entityOwner="user:default/guest"
          setEntityOwner={jest.fn()}
          pullRequest={{
            cupcake: getPRTemplate(
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
    expect(getByText(/ServiceNow ticket details/i)).toBeInTheDocument();
    expect(getByText(/Preview ServiceNow ticket/i)).toBeInTheDocument();
    expect(getByText(/Preview entities/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/Component Name/)).toHaveValue('cupcake');
  });

  it('should render the pull request preview form', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
        },
        approvalTool: ApprovalTool.Git,
      },
    });

    const { getByText, getByPlaceholderText } = render(
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
        <PreviewPullRequestForm
          repoId="org/dessert/cupcake"
          repoUrl="https://github.com/org/dessert/cupcake"
          entityOwner="user:default/guest"
          setEntityOwner={jest.fn()}
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
    expect(getByText(/Pull request details/i)).toBeInTheDocument();
    expect(getByText(/Preview pull request/i)).toBeInTheDocument();
    expect(getByText(/Preview entities/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/groups and users/)).toBeInTheDocument();
  });

  it('should show field error if PR title/component name field is empty', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/cupcake': mockGetRepositories.repositories[0],
        },
        approvalTool: ApprovalTool.Git,
      },
    });

    const setFormErrors = jest.fn();

    const { getByPlaceholderText } = render(
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
        <PreviewPullRequestForm
          repoId="org/dessert/cupcake"
          repoUrl="https://github.com/org/dessert/cupcake"
          entityOwner="user:default/guest"
          setEntityOwner={jest.fn()}
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
          setFormErrors={setFormErrors}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    const prTitle = getByPlaceholderText(
      /Add Backstage catalog entity descriptor files/,
    );
    fireEvent.change(prTitle, { target: { value: '' } });
    expect(setFormErrors).toHaveBeenCalledWith({
      'org/dessert/cupcake': {
        prTitle: 'Pull request title is missing',
      },
    });

    const componentName = getByPlaceholderText(/Component Name/);
    fireEvent.change(componentName, { target: { value: '' } });
    expect(setFormErrors).toHaveBeenCalledWith({
      'org/dessert/cupcake': {
        componentName: 'Component name is missing',
      },
    });
  });
});

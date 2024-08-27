import React, { useState } from 'react';

import { configApiRef } from '@backstage/core-plugin-api';
import { CatalogApi, catalogApiRef } from '@backstage/plugin-catalog-react';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { fireEvent, render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { mockGetRepositories } from '../../mocks/mockData';
import { mockEntities } from '../../mocks/mockEntities';
import { ApprovalTool, RepositoryStatus } from '../../types';
import { getPRTemplate } from '../../utils/repository-utils';
import { PreviewPullRequest } from './PreviewPullRequest';

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

const seState = jest.fn();

beforeEach(() => {
  (useState as jest.Mock).mockImplementation(initial => [initial, seState]);
});

const mockCatalogApi: Partial<CatalogApi> = {
  getEntities: jest.fn().mockReturnValue(mockEntities),
};

describe('Preview Pull Request', () => {
  it('should render the pull request preview', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
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
        ]}
      >
        <PreviewPullRequest
          repoName="org/dessert/Cupcake"
          pullRequest={{
            'org/dessert/Cupcake': getPRTemplate(
              'org/dessert/Cupcake',
              'org/dessert',
              'user:default/guest',
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

  // Enable this test when Service Now approval tool is supported
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('should render the servicenow ticket preview', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
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
        ]}
      >
        <PreviewPullRequest
          repoName="Cupcake"
          pullRequest={{
            Cupcake: getPRTemplate(
              'org/dessert/Cupcake',
              'org/dessert',
              'user:default/guest',
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
    expect(getByPlaceholderText(/Component Name/)).toHaveValue('Cupcake');
  });

  it('should show field error if PR title/component name field is empty', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
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
        ]}
      >
        <PreviewPullRequest
          repoName="org/dessert/Cupcake"
          pullRequest={{
            'org/dessert/Cupcake': getPRTemplate(
              'org/dessert/Cupcake',
              'org/dessert',
              'user:default/guest',
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
      'org/dessert/Cupcake': {
        prTitle: 'Pull request title is missing',
      },
    });

    const componentName = getByPlaceholderText(/Component Name/);
    fireEvent.change(componentName, { target: { value: '' } });
    expect(setFormErrors).toHaveBeenCalledWith({
      'org/dessert/Cupcake': {
        componentName: 'Component name is missing',
      },
    });
  });

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
        ]}
      >
        <PreviewPullRequest
          repoName="org/dessert/cupcake"
          pullRequest={{
            'org/dessert/cupcake': getPRTemplate(
              'org/dessert/cupcake',
              'org/dessert',
              'user:default/guest',
            ),
          }}
          setFormErrors={() => jest.fn()}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    expect(getByText(/Error: Failed to create PR/)).toBeInTheDocument();
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
        ]}
      >
        <PreviewPullRequest
          repoName="org/dessert/cupcake"
          pullRequest={{
            'org/dessert/cupcake': getPRTemplate(
              'org/dessert/cupcake',
              'org/dessert',
              'user:default/guest',
            ),
          }}
          setFormErrors={() => jest.fn()}
          formErrors={{}}
          setPullRequest={() => jest.fn()}
        />
      </TestApiProvider>,
    );
    expect(
      getByText(/Info: Important message for your repository/),
    ).toBeInTheDocument();
    expect(
      getByText(
        /Since catalog-info.yaml already exists in the repository, no new PR will be created. However, the entity will still be registered in the catalog page./,
      ),
    ).toBeInTheDocument();
  });
});

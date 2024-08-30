import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { fireEvent, render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import {
  mockGetOrganizations,
  mockGetRepositories,
} from '../../mocks/mockData';
import { RepositorySelection } from '../../types';
import { PreviewFile } from './PreviewFile';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
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

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));
const setState = jest.fn();

beforeEach(() => {
  (useState as jest.Mock).mockImplementation(initial => [initial, setState]);
});

describe('Preview File', () => {
  it('should render pull request preview for the selected repository', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
        },
      },
    });
    const { queryByTestId, getByText } = render(
      <BrowserRouter>
        <PreviewFile
          data={mockGetRepositories.repositories[0]}
          repositoryType={RepositorySelection.Repository}
        />
      </BrowserRouter>,
    );
    expect(getByText(/Preview File/i)).toBeInTheDocument();
    expect(queryByTestId('preview-file')).toBeInTheDocument();
    const previewButton = getByText(/Preview File/i);
    fireEvent.click(previewButton);
    expect(setState).toHaveBeenCalledWith(true);
  });

  it('should render pull requests preview for the selected repositories in the organization view', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: {
          'org/dessert/Cupcake': mockGetRepositories.repositories[0],
          'org/dessert/Donut': mockGetRepositories.repositories[1],
        },
      },
    });
    const { queryByTestId, getByText } = render(
      <BrowserRouter>
        <PreviewFile
          data={{
            ...mockGetOrganizations.organizations[0],
            selectedRepositories: {
              'org/dessert/cupcake': mockGetRepositories.repositories[0],
              'org/dessert/donut': mockGetRepositories.repositories[1],
            },
          }}
          repositoryType={RepositorySelection.Organization}
        />
      </BrowserRouter>,
    );
    expect(getByText(/Preview files/i)).toBeInTheDocument();
    expect(queryByTestId('preview-files')).toBeInTheDocument();
    const previewButton = getByText(/Preview files/i);
    fireEvent.click(previewButton);
    expect(setState).toHaveBeenCalledWith(true);
  });

  it('should show the status of the catalog-info', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
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
      <BrowserRouter>
        <PreviewFile
          data={{
            ...mockGetOrganizations.organizations[0],
            selectedRepositories: {
              'org/dessert/cupcake': mockGetRepositories.repositories[0],
              'org/dessert/donut': mockGetRepositories.repositories[1],
            },
          }}
          repositoryType={RepositorySelection.Organization}
        />
      </BrowserRouter>,
    );
    expect(getByText(/Failed to create PR/i)).toBeInTheDocument();
    expect(queryByTestId('failed')).toBeInTheDocument();
    const editButton = getByText(/Edit/i);
    fireEvent.click(editButton);
    expect(setState).toHaveBeenCalledWith(true);
  });
});

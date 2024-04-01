import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { fireEvent, render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { getDataForRepositories } from '../../mocks/mockData';
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
const seState = jest.fn();

beforeEach(() => {
  (useState as jest.Mock).mockImplementation(initial => [initial, seState]);
});

describe('Preview File', () => {
  it('should render pull request preview for the selected repository', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: getDataForRepositories('user:default/guest')[0],
      },
    });
    const { queryByTestId, getByText } = render(
      <BrowserRouter>
        <PreviewFile
          data={getDataForRepositories('user:default/guest')[0]}
          repositoryType={RepositorySelection.Repository}
        />
      </BrowserRouter>,
    );
    expect(getByText(/Preview File/i)).toBeInTheDocument();
    expect(queryByTestId('preview-file')).toBeInTheDocument();
    const previewButton = getByText(/Preview File/i);
    fireEvent.click(previewButton);
    expect(seState).toHaveBeenCalledWith(true);
  });

  it('should render pull requests preview for the selected repositories in the organization view', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: getDataForRepositories('user:default/guest').slice(0, 3),
        selectedRepositories: getDataForRepositories(
          'user:default/guest',
        ).slice(0, 2),
      },
    });
    const { queryByTestId, getByText } = render(
      <BrowserRouter>
        <PreviewFile
          data={{
            id: 1,
            selectedRepositories: getDataForRepositories(
              'user:default/guest',
            ).slice(0, 2),
          }}
          repositoryType={RepositorySelection.Organization}
        />
      </BrowserRouter>,
    );
    expect(getByText(/Preview Files/i)).toBeInTheDocument();
    expect(queryByTestId('preview-files')).toBeInTheDocument();
    const previewButton = getByText(/Preview Files/i);
    fireEvent.click(previewButton);
    expect(seState).toHaveBeenCalledWith(true);
  });
});

import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAsync } from 'react-use';

import { usePermission } from '@backstage/plugin-permission-react';

import { fireEvent, render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { mockGetImportJobs, mockGetRepositories } from '../../mocks/mockData';
import { RepositoryStatus } from '../../types';
import CatalogInfoAction from './CatalogInfoAction';

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn(),
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));

const setState = jest.fn();

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

const mockUseAsync = useAsync as jest.MockedFunction<typeof useAsync>;

beforeEach(() => {
  (useState as jest.Mock).mockImplementation(initial => [initial, setState]);
});

describe('CatalogInfoAction', () => {
  it('should allow users to edit the catalog-info.yaml PR if the PR is waiting to be approved', async () => {
    mockUseAsync.mockReturnValue({
      loading: false,
      value: mockGetImportJobs.imports[0],
    });
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });

    (useFormikContext as jest.Mock).mockReturnValue({
      setSubmitting: jest.fn(),
      setStatus: jest.fn(),
      isSubmitting: false,
      values: {
        repositories: {
          ['org/dessert/cupcake']: {
            ...mockGetImportJobs.imports[0],
            catalogInfoYaml: {
              status: RepositoryStatus.WAIT_PR_APPROVAL,
            },
          },
        },
      },
    });
    const { getByTestId } = render(
      <BrowserRouter>
        <CatalogInfoAction
          data={{
            ...mockGetRepositories.repositories[0],
            catalogInfoYaml: {
              status: RepositoryStatus.WAIT_PR_APPROVAL,
            },
          }}
        />
      </BrowserRouter>,
    );
    expect(getByTestId('edit-catalog-info')).toBeInTheDocument();
    fireEvent.click(getByTestId('update'));
    expect(setState).toHaveBeenCalledWith(true);
  });

  it('should allow users to view the catalog-info.yaml if the entity is registered', async () => {
    mockUseAsync.mockReturnValue({
      loading: false,
      value: {
        ...mockGetImportJobs.imports[0],
        status: RepositoryStatus.ADDED,
      },
    });
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });

    (useFormikContext as jest.Mock).mockReturnValue({
      setSubmitting: jest.fn(),
      setStatus: jest.fn(),
      isSubmitting: false,
      values: {
        repositories: {
          ['org/dessert/cupcake']: {
            ...mockGetImportJobs.imports[0],
            catalogInfoYaml: {
              status: RepositoryStatus.ADDED,
            },
          },
        },
      },
    });
    const { getByTestId } = render(
      <BrowserRouter>
        <CatalogInfoAction data={mockGetRepositories.repositories[0]} />
      </BrowserRouter>,
    );
    expect(getByTestId('view-catalog-info')).toBeInTheDocument();
    expect(getByTestId('OpenInNewIcon')).toBeInTheDocument();
  });
});

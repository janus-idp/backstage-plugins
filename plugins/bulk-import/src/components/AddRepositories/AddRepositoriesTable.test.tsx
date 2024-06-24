import React, { useState } from 'react';

import { identityApiRef } from '@backstage/core-plugin-api';
import { TestApiProvider } from '@backstage/test-utils';

import { render } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { getDataForRepositories } from '../../mocks/mockData';
import { RepositorySelection } from '../../types';
import { AddRepositoriesTable } from './AddRepositoriesTable';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));

const seState = jest.fn();

beforeEach(() => {
  (useState as jest.Mock).mockImplementation(initial => [initial, seState]);
});

describe('Add Repositories Table', () => {
  const mockIdentityApi = {
    getBackstageIdentity: jest.fn(),
  };
  mockIdentityApi.getBackstageIdentity.mockResolvedValue({
    type: 'user',
    userEntityRef: 'user:default/foo',
    ownershipEntityRefs: [],
  });
  it('should render list of repositories', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: getDataForRepositories('user:default/guest').slice(0, 2),
        repositoryType: RepositorySelection.Repository,
      },
    });
    const { getByText, getByTestId } = render(
      <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
        <AddRepositoriesTable title="Selected repositories" />
      </TestApiProvider>,
    );
    expect(getByText('Selected repositories (0)')).toBeInTheDocument();
    expect(getByTestId('repository-view')).toBeTruthy();
    expect(getByTestId('organization-view')).toBeTruthy();
    expect(getByTestId('repositories-table')).toBeTruthy();
  });

  it('should render list of organizations', async () => {
    (useFormikContext as jest.Mock).mockReturnValue({
      errors: {},
      values: {
        repositories: getDataForRepositories('user:default/guest').slice(0, 2),
        repositoryType: RepositorySelection.Organization,
      },
    });
    const { getByText, getByTestId } = render(
      <TestApiProvider apis={[[identityApiRef, mockIdentityApi]]}>
        <AddRepositoriesTable title="Selected repositories" />
      </TestApiProvider>,
    );
    expect(getByText('Selected repositories (0)')).toBeInTheDocument();
    expect(getByTestId('repository-view')).toBeTruthy();
    expect(getByTestId('organization-view')).toBeTruthy();
    expect(getByTestId('organizations-table')).toBeTruthy();
  });
});

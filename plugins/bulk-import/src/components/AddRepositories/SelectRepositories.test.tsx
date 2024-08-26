import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAsync } from 'react-use';

import { render } from '@testing-library/react';

import { SelectRepositories } from './SelectRepositories';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAsync: jest.fn().mockReturnValue({ loading: false }),
}));

describe('Select Repositories', () => {
  it('should allow users to select repositories if none are selected yet', () => {
    const mockAsyncData = {
      loading: false,
      value: {
        totalCount: 5,
      },
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    const { getByText, getByTestId } = render(
      <BrowserRouter>
        <SelectRepositories
          onOrgRowSelected={jest.fn()}
          orgData={{
            id: '1',
            selectedRepositories: {},
            defaultBranch: 'main',
            totalReposInOrg: 3,
          }}
          addedRepositoriesCount={0}
        />
      </BrowserRouter>,
    );
    expect(getByTestId('select-repositories')).toBeTruthy();
    expect(getByText('None')).toBeInTheDocument();
  });

  it('should allow users to edit repositories if repositories are selected', () => {
    const mockAsyncData = {
      loading: false,
      value: {
        totalCount: 5,
      },
    };
    (useAsync as jest.Mock).mockReturnValue(mockAsyncData);
    const { getByText, getByTestId } = render(
      <BrowserRouter>
        <SelectRepositories
          onOrgRowSelected={jest.fn()}
          orgData={{
            id: '1',
            totalReposInOrg: 5,
            selectedRepositories: {
              xyz: {
                id: '1',
                repoName: 'xyz',
                defaultBranch: 'main',
              },
            },
            defaultBranch: 'main',
          }}
          addedRepositoriesCount={0}
        />
      </BrowserRouter>,
    );

    expect(getByTestId('edit-repositories')).toBeTruthy();
    expect(getByText('1/5')).toBeInTheDocument();
  });
});

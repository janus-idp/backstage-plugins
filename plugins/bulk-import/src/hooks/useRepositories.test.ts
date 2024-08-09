import { renderHook, waitFor } from '@testing-library/react';

import { mockGetOrganizations, mockGetRepositories } from '../mocks/mockData';
import { useRepositories } from './useRepositories';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getRepositories: jest.fn().mockReturnValue(mockGetRepositories),
    getOrganizations: jest.fn().mockReturnValue(mockGetOrganizations),
    getRepositoriesFromOrg: jest.fn().mockReturnValue({
      ...mockGetRepositories,
      repositories: mockGetRepositories.repositories?.filter(
        r => r.organization === 'org/dessert',
      ),
    }),
  }),
}));

describe('useRepositories', () => {
  it('should return repositories', async () => {
    const { result } = renderHook(() =>
      useRepositories({
        page: 1,
        querySize: 10,
      }),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data.repositories).toHaveLength(10);
    });
  });

  it('should return organizations', async () => {
    const { result } = renderHook(() =>
      useRepositories({ page: 1, querySize: 10, showOrganizations: true }),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data.organizations).toHaveLength(3);
    });
  });

  it('should return repositories in an organization', async () => {
    const { result } = renderHook(() =>
      useRepositories({ page: 1, querySize: 10, orgName: 'org/dessert' }),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data.repositories).toHaveLength(7);
    });
  });
});

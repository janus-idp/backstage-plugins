import { useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { mockGetOrganizations, mockGetRepositories } from '../mocks/mockData';
import { useRepositories } from './useRepositories';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

describe('useRepositories', () => {
  it('should return repositories', async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: mockGetRepositories,
      isLoading: false,
      error: '',
      refetch: jest.fn(),
    });
    const { result } = renderHook(() =>
      useRepositories({
        page: 1,
        querySize: 10,
      }),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(
        Object.values(result.current.data?.repositories || {}).length,
      ).toBe(10);
    });
  });

  it('should return organizations', async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: mockGetOrganizations,
      isLoading: false,
      error: '',
      refetch: jest.fn(),
    });
    const { result } = renderHook(() =>
      useRepositories({ page: 1, querySize: 10, showOrganizations: true }),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(
        Object.values(result.current.data?.organizations || {}).length,
      ).toBe(3);
    });
  });

  it('should return repositories in an organization', async () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: {
        ...mockGetRepositories,
        repositories: mockGetRepositories.repositories?.filter(
          r => r.organization === 'org/dessert',
        ),
      },
      isLoading: false,
      error: '',
      refetch: jest.fn(),
    });
    const { result } = renderHook(() =>
      useRepositories({ page: 1, querySize: 10, orgName: 'org/dessert' }),
    );
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(
        Object.values(result.current.data?.repositories || {}).length,
      ).toBe(7);
    });
  });
});

import { renderHook, waitFor } from '@testing-library/react';

import { mockGetImportJobs, mockGetRepositories } from '../mocks/mockData';
import { useAddedRepositories } from './useAddedRepositories';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getImportJobs: jest.fn().mockReturnValue(mockGetImportJobs),
  }),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn().mockReturnValue({
    data: mockGetImportJobs,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn().mockReturnValue({
    setFieldValue: jest.fn(),
    values: {
      repositories: mockGetRepositories,
    },
  }),
}));

describe('useAddedRepositories', () => {
  it('should return import jobs', async () => {
    const { result } = renderHook(() => useAddedRepositories(1, 5, ''));
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data.totalJobs).toBe(4);
    });
  });
});

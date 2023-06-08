import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useTagDetails } from './quay';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest
    .fn()
    .mockReturnValue({ getSecurityDetails: (param: any) => param }),
}));

describe('useTagDetails', () => {
  it('should return tag details for provided org, repo and digest', async () => {
    const { result } = renderHook(() =>
      useTagDetails('foo', 'bar', 'mock-digest'),
    );
    await waitFor(() => {
      expect(result.current).toEqual({ loading: false, value: 'foo' });
    });
  });
});

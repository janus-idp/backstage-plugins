import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useTags } from './quay';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn().mockReturnValue({
    getSecurityDetails: (param: any) => param,
    getTags: jest.fn().mockReturnValue({
      tags: [{ name: 'tag1', manifest_digest: 'manifestDigest' }],
    }),
  }),
}));

describe('useTags', () => {
  it('should return tags for provided org and repo', async () => {
    const { result } = renderHook(() => useTags('foo', 'bar'));
    await waitFor(() => {
      expect(result.current.loading).toBeFalsy();
      expect(result.current.data).toHaveLength(1);
    });
  });
});

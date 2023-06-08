import { renderHook } from '@testing-library/react-hooks';

import { useRepository } from './quay';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'foo',
        annotations: { 'quay.io/repository-slug': 'foo/bar' },
      },
    },
  }),
}));

describe('useRepository', () => {
  it('should return organization and repository', () => {
    const { result } = renderHook(() => useRepository());
    expect(result.current).toEqual({
      organization: 'foo',
      repository: 'bar',
    });
  });
});

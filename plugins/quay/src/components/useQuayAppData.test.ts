import { useQuayAppData } from '../hooks';
import { Entity } from '@backstage/catalog-model';

describe('useQuayAppData', () => {
  it('should correctly get the repository flag from the entity', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'foo',
        annotations: { 'quay.io/repository-slug': 'foo/bar' },
      },
    };

    const result = useQuayAppData({ entity });

    expect(result).toEqual({ repositorySlug: 'foo/bar' });
  });

  it('should throw an error when the annotation is not present', () => {
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'foo',
      },
    };

    const useResult = () => useQuayAppData({ entity });

    expect(useResult).toThrow("'Quay' annotations are missing");
  });
});

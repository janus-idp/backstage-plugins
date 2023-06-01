import { KubernetesObjects } from '@backstage/plugin-kubernetes';

import { renderHook } from '@testing-library/react-hooks';

import { kubernetesObjects } from '../__fixtures__/kubernetesObject';
import { useResourcesClusters } from './useResourcesClusters';

describe('useResourcesClusters', () => {
  it('should return clusters and errors as empty if no resources found', () => {
    const k8sObjectsResponse = {
      loading: true,
      error: '',
    };
    const { result } = renderHook(() => useResourcesClusters(k8sObjectsResponse));
    expect(result.current.clusters).toEqual([]);
    expect(result.current.errors).toEqual([]);
  });

  it('should return clusters and errors(if any) if resources are present', () => {
    let k8sObjectsResponse = {
      kubernetesObjects: kubernetesObjects,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result, rerender } = renderHook(() => useResourcesClusters(k8sObjectsResponse));
    expect(result.current.clusters).toEqual(['minikube', 'ocp']);
    expect(result.current.errors).toEqual([[], []]);

    const kubernetesObjectsWithError = {
      items: [
        {
          ...kubernetesObjects.items[0],
          errors: [{ errorType: 'FETCH_ERROR', message: 'Couldnt fetch resources' }],
        },
      ],
    };

    k8sObjectsResponse = {
      kubernetesObjects: kubernetesObjectsWithError,
      loading: false,
      error: '',
    } as KubernetesObjects;
    rerender();
    expect(result.current.clusters).toEqual(['minikube']);
    expect(result.current.errors).toEqual([
      [{ errorType: 'FETCH_ERROR', message: 'Couldnt fetch resources' }],
    ]);
  });
});

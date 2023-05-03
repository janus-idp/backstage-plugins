import { renderHook } from '@testing-library/react-hooks';
import { KubernetesObjects } from '@backstage/plugin-kubernetes';
import { kubernetesObject } from '../__fixtures__/kubernetesObject';
import { kubernetesObjectsWithError } from '../__fixtures__/kubernetesObjectWithError';
import { useK8sResourcesClusters } from './useK8sResourcesClusters';

describe('useAllWatchResources', () => {
  it('should return clusters and errors as empty if no resources found', () => {
    const k8sObjectsResponse = {
      loading: true,
      error: '',
    };
    const { result } = renderHook(() =>
      useK8sResourcesClusters(k8sObjectsResponse),
    );
    expect(result.current.clusters).toEqual([]);
    expect(result.current.errors).toEqual([]);
  });

  it('should return clusters and errors(if any) if resources are present', () => {
    let k8sObjectsResponse = {
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result, rerender } = renderHook(() =>
      useK8sResourcesClusters(k8sObjectsResponse),
    );
    expect(result.current.clusters).toEqual(['minikube']);
    expect(result.current.errors).toEqual([[]]);

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

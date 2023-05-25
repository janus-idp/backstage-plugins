import { KubernetesObjects } from '@backstage/plugin-kubernetes';
import { renderHook } from '@testing-library/react-hooks';
import { ModelsPlural } from '../models';
import { kubernetesObjects } from '../__fixtures__/kubernetesObject';
import { useAllWatchResources } from './useAllWatchResources';

const watchedResources = [ModelsPlural.pipelineruns, ModelsPlural.taskruns];

describe('useAllWatchResources', () => {
  it('should return watchResourcesData as empty if no resources found', () => {
    const k8sObjectsResponse = {
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources(k8sObjectsResponse, 0, watchedResources),
    );
    expect(result.current).toEqual({});
  });

  it('should return watchResourcesData if resources are present', () => {
    const k8sObjectsResponse = {
      kubernetesObjects,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources(k8sObjectsResponse, 0, watchedResources),
    );
    expect(result.current?.pipelineruns?.data).toHaveLength(2);
    expect(result.current?.taskruns).toBeUndefined();
  });

  it('should return watchResourcesData as empty if resources are present but it is not in in watchedResources', () => {
    const k8sObjectsResponse = {
      kubernetesObjects,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources(k8sObjectsResponse, 0, []),
    );
    expect(result.current).toEqual({});
  });

  it('should update watchResourcesData as per API response', () => {
    let k8sObjectsResponse = {
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result, rerender } = renderHook(() =>
      useAllWatchResources(k8sObjectsResponse, 0, watchedResources),
    );
    expect(result.current).toEqual({});

    k8sObjectsResponse = {
      kubernetesObjects,
      loading: false,
      error: '',
    } as KubernetesObjects;
    rerender();
    expect(result.current?.pipelineruns?.data).toHaveLength(2);
  });
});

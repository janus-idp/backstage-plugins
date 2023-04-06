import { useAllWatchResources } from './useAllWatchResources';
import { renderHook } from '@testing-library/react-hooks';
import { KubernetesObjects } from '@backstage/plugin-kubernetes';
import { kubernetesObject } from '../__fixtures__/kubernetesObject';
import { ModelsPlural } from '../models';

const watchedResources = [
  ModelsPlural.deployments,
  ModelsPlural.pods,
  ModelsPlural.services,
  ModelsPlural.replicasets,
  ModelsPlural.daemonsets,
  ModelsPlural.statefulsets,
  ModelsPlural.jobs,
  ModelsPlural.cronjobs,
];

describe('useAllWatchResources', () => {
  it('should return watchResourcesData as empty if no resources found', () => {
    const k8sObjectsResponse = {
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources(watchedResources, k8sObjectsResponse, 0),
    );
    expect(result.current).toEqual({});
  });

  it('should return watchResourcesData if resources are present', () => {
    const k8sObjectsResponse = {
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources(watchedResources, k8sObjectsResponse, 0),
    );
    expect(result.current?.pods?.data).toHaveLength(8);
    expect(result.current?.deployments?.data).toHaveLength(0);
    expect(result.current?.statefulsets?.data).toHaveLength(2);
    expect(result.current?.cronjobs?.data).toHaveLength(1);
    expect(result.current?.jobs?.data).toHaveLength(2);
  });

  it('should return watchResourcesData as empty if resources are present but it is not in in watchedResources', () => {
    const k8sObjectsResponse = {
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result } = renderHook(() =>
      useAllWatchResources([], k8sObjectsResponse, 0),
    );
    expect(result.current).toEqual({});
  });

  it('should update watchResourcesData as per API response', () => {
    let k8sObjectsResponse = {
      loading: false,
      error: '',
    } as KubernetesObjects;
    const { result, rerender } = renderHook(() =>
      useAllWatchResources(watchedResources, k8sObjectsResponse, 0),
    );
    expect(result.current).toEqual({});

    k8sObjectsResponse = {
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    } as KubernetesObjects;
    rerender();
    expect(result.current?.pods?.data).toHaveLength(8);
    expect(result.current?.deployments?.data).toHaveLength(0);
  });
});

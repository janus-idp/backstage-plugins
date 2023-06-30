import { useKubernetesObjects } from '@backstage/plugin-kubernetes';

import { act, renderHook } from '@testing-library/react-hooks';

import { watchResourcesData } from '../__fixtures__/k8sResourcesContextData';
import { kubernetesObject } from '../__fixtures__/kubernetesObject';
import { ModelsPlural } from '../models';
import { useK8sObjectsResponse } from './useK8sObjectsResponse';

const watchedResources = [
  ModelsPlural.deployments,
  ModelsPlural.pods,
  ModelsPlural.services,
  ModelsPlural.replicasets,
];

jest.mock('@backstage/plugin-kubernetes', () => ({
  useKubernetesObjects: jest.fn(),
}));

const mockUseKubernetesObjects = useKubernetesObjects as jest.Mock;

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      metadata: {
        name: 'test',
      },
    },
  }),
}));

describe('useK8sObjectsResponse', () => {
  it('should return k8sResourcesContextData', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useK8sObjectsResponse(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual(watchResourcesData);
    expect(result.current.clusters).toEqual(['minikube']);
    expect(result.current.selectedClusterErrors).toEqual([]);
  });

  it('should return k8sResourcesContextData with empty clusters if it does not exist', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: { items: [] },
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useK8sObjectsResponse(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.clusters).toEqual([]);
    expect(result.current.selectedClusterErrors).toEqual([]);
  });

  it('should return k8sResourcesContextData with 2 clusters', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: {
        items: [{ cluster: { name: 'OCP' } }, kubernetesObject.items[0]],
      },
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useK8sObjectsResponse(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.clusters).toEqual(['OCP', 'minikube']);
    expect(result.current.selectedClusterErrors).toEqual([]);
    expect(result.current.selectedCluster).toEqual(0);
  });

  it('should return k8sResourcesContextData with 2 clusters and update selectedCluster', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: {
        items: [{ cluster: { name: 'OCP' } }, kubernetesObject.items[0]],
      },
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useK8sObjectsResponse(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.clusters).toEqual(['OCP', 'minikube']);
    expect(result.current.selectedClusterErrors).toEqual([]);
    expect(result.current.selectedCluster).toEqual(0);

    act(() => {
      result.current.setSelectedCluster(1);
    });

    expect(result.current.watchResourcesData).toEqual(watchResourcesData);
    expect(result.current.clusters).toEqual(['OCP', 'minikube']);
    expect(result.current.selectedClusterErrors).toEqual([]);
    expect(result.current.selectedCluster).toEqual(1);
  });
});

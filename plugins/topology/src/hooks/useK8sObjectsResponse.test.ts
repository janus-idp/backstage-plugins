import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import { renderHook } from '@testing-library/react-hooks';
import { kubernetesObject } from '../__fixtures__/kubernetesObject';
import { watchResourcesData } from '../__fixtures__/k8sResourcesContextData';
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
});

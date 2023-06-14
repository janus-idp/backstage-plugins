import { useKubernetesObjects } from '@backstage/plugin-kubernetes';

import { waitFor } from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { kubernetesObjects } from '../__fixtures__/kubernetesObject';
import { ModelsPlural } from '../models';
import { useTektonObjectsResponse } from './useTektonObjectsResponse';

const watchedResources = [ModelsPlural.pipelineruns, ModelsPlural.taskruns];

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

const watchResourcesData = {
  pipelineruns: {
    data: mockKubernetesPlrResponse.pipelineruns,
  },
};

describe('useTektonObjectResponse', () => {
  it('should return k8sResourcesContextData', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects,
      loading: false,
      error: '',
    });
    const { result, rerender } = renderHook(() =>
      useTektonObjectsResponse(watchedResources),
    );
    rerender();
    await waitFor(() => {
      expect(result.current.watchResourcesData).toEqual(watchResourcesData);
      expect(result.current.clusters).toEqual(['minikube', 'ocp']);
      expect(result.current.selectedClusterErrors).toEqual([]);
    });
  });

  it('should be able to select a cluster and return data accordingly', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects,
      loading: false,
      error: '',
    });
    const { result } = renderHook(() =>
      useTektonObjectsResponse(watchedResources),
    );
    expect(result.current.selectedCluster).toEqual(0);
    act(() => {
      result.current.setSelectedCluster(1);
    });
    await waitFor(() => {
      expect(result.current.watchResourcesData).toEqual({});
      expect(result.current.clusters).toEqual(['minikube', 'ocp']);
      expect(result.current.selectedClusterErrors).toEqual([]);
      expect(result.current.selectedCluster).toEqual(1);
    });
  });

  it('should return responseError with loaded if unable to fetch data', async () => {
    mockUseKubernetesObjects.mockReturnValue({
      error:
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
    });
    const { result } = renderHook(() =>
      useTektonObjectsResponse(watchedResources),
    );
    await waitFor(() => {
      expect(result.current.watchResourcesData).toBeUndefined();
      expect(result.current.clusters).toEqual([]);
      expect(result.current.selectedClusterErrors).toEqual([]);
      expect(result.current.loaded).toEqual(true);
      expect(result.current.responseError).toEqual(
        'getaddrinfo ENOTFOUND api.rhoms-4.13-052404.dev.openshiftappsvc.org',
      );
    });
  });
});

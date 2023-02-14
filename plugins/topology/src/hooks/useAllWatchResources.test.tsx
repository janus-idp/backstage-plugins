import { useAllWatchResources } from './useAllWatchResources';
import { renderHook } from '@testing-library/react-hooks';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import kubernetesObject from '../__fixtures__/kubernetesObject.json';
import { ModelsPlural } from '../models';

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

const watchedResources = [
  ModelsPlural.deployments,
  ModelsPlural.pods,
  ModelsPlural.services,
  ModelsPlural.replicasets,
];

describe('useAllWatchResources', () => {
  it('should return loading as true, with no error if request is pending', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: [],
      loading: true,
      error: '',
    });
    const { result } = renderHook(() => useAllWatchResources(watchedResources));
    expect(result.current.loading).toEqual(true);
  });

  it('should return watchResourcesData as empty, loading as false, with no error if no resources found', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: [],
      loading: false,
      error: '',
    });
    const { result } = renderHook(() => useAllWatchResources(watchedResources));
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.loading).toEqual(false);
  });

  it('should return watchResourcesData, loading as false, with no error if resources are present', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    });
    const { result } = renderHook(() => useAllWatchResources(watchedResources));
    expect(result.current.watchResourcesData?.pods?.data).toHaveLength(1);
    expect(result.current.watchResourcesData?.deployments?.data).toHaveLength(
      0,
    );
    expect(result.current.loading).toEqual(false);
  });

  it('should return watchResourcesData as empty, loading as false, with no error if resources are present but it is not in in watchedResources', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    });
    const { result } = renderHook(() => useAllWatchResources());
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.loading).toEqual(false);
  });

  it('should update watchResourcesData as per API response', () => {
    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: [],
      loading: false,
      error: '',
    });
    const { result, rerender } = renderHook(() =>
      useAllWatchResources(watchedResources),
    );
    expect(result.current.watchResourcesData).toEqual({});
    expect(result.current.loading).toEqual(false);

    mockUseKubernetesObjects.mockReturnValue({
      kubernetesObjects: kubernetesObject,
      loading: false,
      error: '',
    });
    rerender();
    expect(result.current.watchResourcesData?.pods?.data).toHaveLength(1);
    expect(result.current.watchResourcesData?.deployments?.data).toHaveLength(
      0,
    );
    expect(result.current.loading).toEqual(false);
  });
});

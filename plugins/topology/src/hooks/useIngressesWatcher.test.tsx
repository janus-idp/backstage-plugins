import { V1Deployment } from '@kubernetes/client-node';
import { renderHook } from '@testing-library/react-hooks';
import {
  mockK8sResourcesData,
  mockKubernetesResponse,
} from '../__fixtures__/1-deployments';
import { useIngressesWatcher } from './useIngressesWatcher';
import { useServicesWatcher } from './useServicesWatcher';

// mock useServicesWatcher to return a value
jest.mock('./useServicesWatcher', () => ({
  useServicesWatcher: jest.fn(),
}));

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useContext: () => mockK8sResourcesData,
  };
});

const mockUseServicesWatcher = useServicesWatcher as jest.Mock;

describe('useIngressesWatcher', () => {
  it('should not return ingresses if api is not loaded', () => {
    mockUseServicesWatcher.mockReturnValue({
      loaded: false,
      loadError: '',
      services: [],
    });
    const { result } = renderHook(() =>
      useIngressesWatcher(
        mockKubernetesResponse.deployments[0] as unknown as V1Deployment,
      ),
    );
    expect(result.current.loaded).toBe(false);
    expect(result.current.loadError).toBe('');
    expect(result.current.ingresses).toEqual([]);
  });

  it('should return ingresses if api is loaded', () => {
    mockUseServicesWatcher.mockReturnValue({
      loaded: true,
      loadError: null,
      services: mockKubernetesResponse.services,
    });
    const { result } = renderHook(() =>
      useIngressesWatcher(
        mockKubernetesResponse.deployments[0] as unknown as V1Deployment,
      ),
    );
    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBe(null);
    expect(result.current.ingresses).toEqual(mockKubernetesResponse.ingresses);
  });

  it('should not return ingresses if no matching services found', () => {
    mockUseServicesWatcher.mockReturnValue({
      loaded: true,
      loadError: null,
      services: [],
    });
    const { result } = renderHook(() =>
      useIngressesWatcher(
        mockKubernetesResponse.deployments[0] as unknown as V1Deployment,
      ),
    );
    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBe(null);
    expect(result.current.ingresses).toEqual([]);
  });
});

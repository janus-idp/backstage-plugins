import { renderHook } from '@testing-library/react-hooks';
import { useIngressURL } from './useIngressURL';
import { mockKubernetesResponse } from '../__fixtures__/1-deployments';
import { V1Deployment } from '@kubernetes/client-node';
import { useIngressesWatcher } from './useIngressesWatcher';

// mock useIngressesWatcher to return a value
jest.mock('./useIngressesWatcher', () => ({
  useIngressesWatcher: jest.fn(),
}));

const mockUseIngressesWatcher = useIngressesWatcher as jest.Mock;

describe('useIngressURL', () => {
  it('should return URL if ingresses are found', () => {
    mockUseIngressesWatcher.mockReturnValue({
      loaded: true,
      loadError: null,
      ingresses: mockKubernetesResponse.ingresses,
    });
    const { result } = renderHook(() =>
      useIngressURL(
        mockKubernetesResponse.deployments[0] as unknown as V1Deployment,
      ),
    );
    expect(result.current).toBe('http://hello-world-app.info/');
  });

  it('should return null if ingresses are not found', () => {
    mockUseIngressesWatcher.mockReturnValue({
      loaded: true,
      loadError: null,
      ingresses: [],
    });
    const { result } = renderHook(() =>
      useIngressURL(
        mockKubernetesResponse.deployments[0] as unknown as V1Deployment,
      ),
    );
    expect(result.current).toBe(null);
  });
});

import { V1Deployment } from '@kubernetes/client-node';
import { renderHook } from '@testing-library/react-hooks';
import { useContext } from 'react';
import {
  mockK8sResourcesData,
  mockKubernetesResponse,
} from '../__fixtures__/1-deployments';
import { useServicesWatcher } from './useServicesWatcher';

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  debounce: (fn: { cancel: jest.Mock<any, any, any> }) => {
    fn.cancel = jest.fn();
    return fn;
  },
}));

jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useContext: jest.fn(),
  };
});

const mockUseContext = useContext as jest.Mock;

describe('useServicesWatcher', () => {
  it('should not return services if api is not loaded', () => {
    mockUseContext.mockReturnValue({
      loading: true,
      error: '',
      watchResourcesData: {},
    });
    const { result } = renderHook(() =>
      useServicesWatcher(
        mockKubernetesResponse.deployments[0] as unknown as V1Deployment,
      ),
    );
    expect(result.current.loaded).toBe(false);
    expect(result.current.loadError).toBe('');
    expect(result.current.services).toBeUndefined();
  });

  it('should return services if api is loaded', () => {
    mockUseContext.mockReturnValue({
      loading: true,
      error: '',
      watchResourcesData: {},
    });
    const { result, rerender } = renderHook(() =>
      useServicesWatcher(
        mockKubernetesResponse.deployments[0] as unknown as V1Deployment,
      ),
    );
    expect(result.current.loaded).toBe(false);
    mockUseContext.mockReturnValue(mockK8sResourcesData);

    rerender();
    expect(result.current.loaded).toBe(true);
    expect(result.current.loadError).toBe('');
    expect(result.current.services).toEqual(mockKubernetesResponse.services);
  });
});

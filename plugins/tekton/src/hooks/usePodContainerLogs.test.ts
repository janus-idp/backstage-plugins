import { useApi } from '@backstage/core-plugin-api';

import { renderHook } from '@testing-library/react-hooks';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { usePodContainerLogs } from './usePodContainerLogs';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('usePodContainerLogs', () => {
  it('should return loading as true and value as undefined initially', () => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      usePodContainerLogs({
        pod: mockKubernetesPlrResponse.pods[0] as any,
        containerName:
          mockKubernetesPlrResponse.pods[0].spec.containers[0].name,
      }),
    );

    waitForNextUpdate();

    expect(result.current.loading).toEqual(true);
    expect(result.current.value).toBeUndefined();
  });

  it('should return value as log text', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      usePodContainerLogs({
        pod: mockKubernetesPlrResponse.pods[0] as any,
        containerName:
          mockKubernetesPlrResponse.pods[0].spec.containers[0].name,
      }),
    );

    await waitForNextUpdate();

    expect(result.current.value).toEqual({ text: 'log data...' });
  });
});

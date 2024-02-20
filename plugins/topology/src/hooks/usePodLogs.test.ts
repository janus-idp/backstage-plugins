import { useApi } from '@backstage/core-plugin-api';

import { renderHook, waitFor } from '@testing-library/react';

import { usePodLogs } from './usePodLogs';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('usePodLogs', () => {
  it('should return loading as true and value as undefined initially', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
    });
    const { result } = renderHook(() =>
      usePodLogs({
        stopPolling: true,
        podScope: {
          podName: 'node-ex-git-er56',
          podNamespace: 'sample-app',
          containerName: 'node-ex-git',
          clusterName: 'OCP',
        },
        intervalMs: 500,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toEqual(true);
    });

    await waitFor(() => {
      expect(result.current.value).toBeUndefined();
    });
  });

  it('should return value as log text', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockResolvedValueOnce({ text: 'log data...' }),
    });
    const { result } = renderHook(() =>
      usePodLogs({
        stopPolling: true,
        podScope: {
          podName: 'node-ex-git-er56',
          podNamespace: 'sample-app',
          containerName: 'node-ex-git',
          clusterName: 'OCP',
        },
        intervalMs: 500,
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toEqual(true);
    });

    await waitFor(() => {
      expect(result.current.value).toEqual({ text: 'log data...' });
    });
  });
});

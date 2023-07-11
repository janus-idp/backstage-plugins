import { useApi } from '@backstage/core-plugin-api';

import { renderHook } from '@testing-library/react-hooks';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { usePodLogsOfPipelineRun } from './usePodLogsOfPipelineRun';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('usePodLogsOfPipelineRun', () => {
  it('should return loading as true and value as undefined initially', () => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      usePodLogsOfPipelineRun({
        pod: mockKubernetesPlrResponse.pods[0] as any,
        intervalMs: 500,
      }),
    );

    waitForNextUpdate();

    expect(result.current.loading).toEqual(true);
    expect(result.current.value).toBeUndefined();
  });

  it('should return value as log text', async () => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockResolvedValueOnce({ text: 'log data...' }),
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      usePodLogsOfPipelineRun({
        pod: mockKubernetesPlrResponse.pods[0] as any,
        intervalMs: 500,
      }),
    );

    await waitForNextUpdate();

    expect(result.current.value).toEqual([{ text: 'log data...' }]);
  });
});

import { renderHook } from '@testing-library/react-hooks';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { usePipelineRunScanResults } from './usePipelineRunScanResults';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('usePipelineRunVulnerabilities', () => {
  it('should return vulnerabilities when SCAN_OUTPUT is set', () => {
    const { result } = renderHook(() =>
      usePipelineRunScanResults(mockKubernetesPlrResponse.pipelineruns[2]),
    );

    expect(result.current.vulnerabilities?.critical).toEqual(13);
    expect(result.current.vulnerabilities?.high).toEqual(29);
    expect(result.current.vulnerabilities?.medium).toEqual(32);
    expect(result.current.vulnerabilities?.low).toEqual(3);
  });
  it('should return vulnerabilities when the suffix SCAN_OUTPUT is set', () => {
    const { result } = renderHook(() =>
      usePipelineRunScanResults(mockKubernetesPlrResponse.pipelineruns[4]),
    );

    expect(result.current.vulnerabilities?.critical).toEqual(1);
    expect(result.current.vulnerabilities?.high).toEqual(9);
    expect(result.current.vulnerabilities?.medium).toEqual(20);
    expect(result.current.vulnerabilities?.low).toEqual(1);
  });
  it('should accumulate all vulnerabilities', () => {
    const { result } = renderHook(() => {
      const results4 =
        mockKubernetesPlrResponse.pipelineruns[4].status.pipelineResults?.[0];
      const results1 =
        mockKubernetesPlrResponse.pipelineruns[2].status.results?.[0];
      const plr = {
        ...mockKubernetesPlrResponse.pipelineruns[2],
        status: {
          ...mockKubernetesPlrResponse.pipelineruns[2].status,
          results: results4 && results1 ? [results4, results1] : [],
        },
      };
      return usePipelineRunScanResults(plr);
    });

    expect(result.current.vulnerabilities?.critical).toEqual(14);
    expect(result.current.vulnerabilities?.high).toEqual(38);
    expect(result.current.vulnerabilities?.medium).toEqual(52);
    expect(result.current.vulnerabilities?.low).toEqual(4);
  });
});

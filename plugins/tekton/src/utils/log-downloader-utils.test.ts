import { ContainerScope } from '../hooks/usePodLogsOfPipelineRun';
import { getPodLogs } from './log-downloader-utils';
import { testPods } from './pods-data';

describe('getPodLogs', () => {
  it('should return empty logs if there are no pods', async () => {
    const podLogsGetter = () => Promise.resolve({ text: '' });
    const logs = await getPodLogs([], podLogsGetter, 'cluster-1');

    expect(logs).toBe('');
  });

  it('should return logs if there are pods', async () => {
    const podLogsGetter = (p: ContainerScope) => {
      return Promise.resolve({ text: `${p.containerName}` });
    };
    const logs = await getPodLogs(testPods, podLogsGetter, 'cluster-1');

    expect(logs).toBe(`STEP-TKN
step-tkn
STEP-PRINT-SBOM-RESULTS
step-print-sbom-results`);
  });
});

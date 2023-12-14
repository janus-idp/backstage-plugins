import { testPods } from '../__fixtures__/pods-data';
import { ContainerScope } from '../hooks/usePodLogsOfPipelineRun';
import { getPodLogs } from './log-downloader-utils';

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

  it('should display logs only for the pods that has logs', async () => {
    const podLogsGetter = (p: ContainerScope) => {
      return Promise.resolve({ text: `${p.containerName}` });
    };

    const podsWithoutContainers = [
      testPods[0],

      { ...testPods[1], spec: { ...testPods[1].spec, containers: [] } },
    ];

    const logs = await getPodLogs(
      podsWithoutContainers,
      podLogsGetter,
      'cluster-1',
    );

    expect(logs).toBe(`STEP-TKN
step-tkn
`);
  });
});

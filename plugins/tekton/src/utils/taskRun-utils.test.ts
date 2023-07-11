import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { getActiveTaskRun, getSortedTaskRuns } from './taskRun-utils';

describe('taskRun-utils', () => {
  it('should return sorted task runs', () => {
    const sortedTaskRuns = getSortedTaskRuns(
      mockKubernetesPlrResponse.taskruns,
    );
    expect(sortedTaskRuns[0].id).toEqual('ruby-ex-git-xf45fo-build');
  });

  it('should return active taskrun as the latest taskrun when active task is not present', () => {
    const activeTaskRun = getActiveTaskRun(
      getSortedTaskRuns(mockKubernetesPlrResponse.taskruns),
      '',
    );
    expect(activeTaskRun).toBe('pipeline-test-wbvtlk-tkn');
  });

  it('should return active taskrun when active task is present', () => {
    const activeTaskRun = getActiveTaskRun(
      getSortedTaskRuns(mockKubernetesPlrResponse.taskruns),
      'pipeline-test-wbvtlk-tkn',
    );
    expect(activeTaskRun).toBe('pipeline-test-wbvtlk-tkn');
  });

  it('should return undefined when active task is not present', () => {
    const activeTaskRun = getActiveTaskRun(
      getSortedTaskRuns(mockKubernetesPlrResponse.taskruns),
      'pipeline-test-wbvt-tkn',
    );
    expect(activeTaskRun).toBe(undefined);
  });
});

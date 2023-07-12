import { mockPLRResponseData } from '../../__fixtures__/1-pipelinesData';
import { getTaskRunsForPipelineRun } from './taskRun-utils';

describe('getTaskRunsForPipelineRun should return taskruns for a pipelinerun', () => {
  it('should return empty array if pipelinerun is null', () => {
    const taskRuns = getTaskRunsForPipelineRun(null, []);
    expect(taskRuns).toEqual([]);
  });

  it('should return empty array if there are no taskruns for a pipelinerun', () => {
    const taskRuns = getTaskRunsForPipelineRun(
      mockPLRResponseData.pipelineruns[0],
      [],
    );
    expect(taskRuns).toEqual([]);
  });

  it('should return taskruns for a pipelinerun', () => {
    let taskRuns = getTaskRunsForPipelineRun(
      mockPLRResponseData.pipelineruns[0],
      mockPLRResponseData.taskruns,
    );
    expect(taskRuns.length).toBe(1);
    taskRuns = getTaskRunsForPipelineRun(
      mockPLRResponseData.pipelineruns[1],
      mockPLRResponseData.taskruns,
    );
    expect(taskRuns.length).toBe(2);
  });
});

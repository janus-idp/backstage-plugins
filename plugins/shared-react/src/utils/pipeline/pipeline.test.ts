import { mockPLRResponseData } from '../../__fixtures__/1-pipelinesData';
import { ComputedStatus } from '../../types';
import {
  getLatestPipelineRun,
  getRunStatusColor,
  getTaskStatus,
  totalPipelineRunTasks,
  updateTaskStatus,
} from './pipeline';

describe('getRunStatusColor should handle ComputedStatus values', () => {
  it('should expect all but PipelineNotStarted to produce a non-default result', () => {
    // Verify that we cover colour states for all the ComputedStatus values
    const failCase = 'PipelineNotStarted';
    const defaultCase = getRunStatusColor(ComputedStatus[failCase]);
    const allOtherStatuses = Object.keys(ComputedStatus)
      .filter(
        status =>
          status !== failCase &&
          ComputedStatus[status as keyof typeof ComputedStatus] !==
            ComputedStatus.Other,
      )
      .map(status => ComputedStatus[status as keyof typeof ComputedStatus]);

    expect(allOtherStatuses).not.toHaveLength(0);
    allOtherStatuses.forEach(statusValue => {
      const { message } = getRunStatusColor(statusValue);

      expect(defaultCase.message).not.toEqual(message);
    });
  });

  it('should expect all status colors to return visible text to show as a descriptor of the color', () => {
    let status = getRunStatusColor(ComputedStatus.Succeeded);
    expect(status.message).toBe('Succeeded');
    status = getRunStatusColor(ComputedStatus.FailedToStart);
    expect(status.message).toBe('PipelineRun failed to start');
    status = getRunStatusColor('xyz');
    expect(status.message).toBe('PipelineRun not started yet');
  });
});

describe('updateTaskStaus should return the Task status', () => {
  it('updateTaskStatus should return the updated task status', () => {
    const updatedTaskStatus = updateTaskStatus(
      mockPLRResponseData.pipelineruns[0],
      mockPLRResponseData.taskruns,
    );
    expect(updatedTaskStatus).toEqual({
      PipelineNotStarted: 0,
      Pending: 0,
      Running: 0,
      Succeeded: 1,
      Failed: 0,
      Cancelled: 0,
      Skipped: 0,
    });
  });

  it('updateTaskStatus should return the updated task status if no taskrun exist', () => {
    const mockPipelineRun = {
      ...mockPLRResponseData.pipelineruns[0],
      status: {},
    };
    const updatedTaskStatus = updateTaskStatus(mockPipelineRun as any, [
      mockPLRResponseData.taskruns[1],
    ]);
    expect(updatedTaskStatus).toEqual({
      PipelineNotStarted: 0,
      Pending: 0,
      Running: 0,
      Succeeded: 0,
      Failed: 0,
      Cancelled: 0,
      Skipped: 0,
    });
  });
});

describe('PipelineRun util getTaskStatus pulls task status state from pipelinerun/taskruns', () => {
  it('should expect to return proper task-count and Succeeded task(s)', () => {
    const pipelineRun = mockPLRResponseData.pipelineruns[0];

    const taskStatus = getTaskStatus(pipelineRun, mockPLRResponseData.taskruns);
    const taskCount = totalPipelineRunTasks(pipelineRun);

    expect(taskStatus.Succeeded).toEqual(1);
    expect(taskCount).toEqual(3);
  });

  it('expect a pipeline to consider finally tasks in task-count', () => {
    const pipelineRun = mockPLRResponseData.pipelineruns[0];

    const taskStatus = getTaskStatus(pipelineRun, mockPLRResponseData.taskruns);
    const taskCount = totalPipelineRunTasks(pipelineRun);

    expect(taskStatus.Succeeded).toEqual(1);
    expect(taskCount).toEqual(3);
  });
});

describe('getLatestPipelineRun', () => {
  it('should return the latest pipelineRun resource', () => {
    expect(
      getLatestPipelineRun(
        mockPLRResponseData.pipelineruns,
        'creationTimestamp',
      )?.metadata?.name,
    ).toBe('pipeline-test-wbvtlk');
  });
});

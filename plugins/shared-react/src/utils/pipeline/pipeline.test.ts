import { mockPLRResponseData } from '../../__fixtures__/1-pipelinesData';
import { ComputedStatus, TaskRunKind } from '../../types';
import {
  getLatestPipelineRun,
  getRunStatusColor,
  getTaskStatus,
  pipelineRunStatus,
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

describe('Check PipelineRun Status | Filter Reducer applied to the following:', () => {
  const mockTaskRuns: TaskRunKind[] = [
    {
      spec: {},
      status: {
        conditions: [{ status: 'False', type: 'Succeeded' }],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [{ status: 'True', type: 'Succeeded' }],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          { status: 'True', type: 'Failure' },
          { status: 'False', type: 'Succeeded' },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          { status: 'True', type: 'Failure' },
          { status: 'True', type: 'Succeeded' },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          { status: 'False', type: 'Failure' },
          { status: 'True', type: 'Succeeded' },
          { status: 'False', type: 'Failure' },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [{ status: 'Unknown', type: 'Succeeded' }],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          { type: 'Succeeded', status: 'Unknown', reason: 'StoppedRunFinally' },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'Unknown',
            reason: 'CancelledRunFinally',
          },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          { type: 'Succeeded', status: 'Unknown', reason: 'TaskRunCancelled' },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
  ];

  const mockTaskRunReasons: TaskRunKind[] = [
    {
      spec: {},
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'Unknown',
            reason: 'PipelineRunStopping',
          },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          { type: 'Succeeded', status: 'Unknown', reason: 'TaskRunStopping' },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'Unknown',
            reason: 'CreateContainerConfigError',
          },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'Unknown',
            reason: 'ExceededNodeResources',
          },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'Unknown',
            reason: 'ExceededResourceQuota',
          },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
    {
      spec: {},
      status: {
        conditions: [
          {
            type: 'Succeeded',
            status: 'Unknown',
            reason: 'ConditionCheckFailed',
          },
        ],
        podName: 'test-pod',
        startTime: '',
      },
    },
  ];
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "False"', () => {
    const reducerOutput = pipelineRunStatus(mockTaskRuns[0]);
    expect(reducerOutput).toBe('Failed');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "True"', () => {
    const reducerOutput = pipelineRunStatus(mockTaskRuns[1]);
    expect(reducerOutput).toBe('Succeeded');
  });
  it('Pipelinerun with second element of condition array with type as "Succeeded" & status as "False"', () => {
    const reducerOutput = pipelineRunStatus(mockTaskRuns[2]);
    expect(reducerOutput).toBe('Failed');
  });
  it('Pipelinerun with second element of condition array with type as "Succeeded" & status as "True"', () => {
    const reducerOutput = pipelineRunStatus(mockTaskRuns[3]);
    expect(reducerOutput).toBe('Succeeded');
  });
  it('Pipelinerun with second element of condition array with type as "Succeeded" & status as "True" and additional condition with type as "Failure"', () => {
    const reducerOutput = pipelineRunStatus(mockTaskRuns[4]);
    expect(reducerOutput).toBe('Succeeded');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "Unknown"', () => {
    let reducerOutput = pipelineRunStatus(mockTaskRuns[5]);
    expect(reducerOutput).toBe('Running');
    reducerOutput = pipelineRunStatus(mockTaskRuns[8]);
    expect(reducerOutput).toBe('Cancelled');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "Unknown" & reason as "StoppedRunFinally"', () => {
    const reducerOutput = pipelineRunStatus(mockTaskRuns[6]);
    expect(reducerOutput).toBe('Cancelled');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "Unknown" & reason as "CancelledRunFinally"', () => {
    const reducerOutput = pipelineRunStatus(mockTaskRuns[7]);
    expect(reducerOutput).toBe('Cancelled');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & Failing condition', () => {
    expect(pipelineRunStatus(mockTaskRunReasons[0])).toBe('Failed');
    expect(pipelineRunStatus(mockTaskRunReasons[1])).toBe('Failed');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & Pending condition', () => {
    expect(pipelineRunStatus(mockTaskRunReasons[2])).toBe('Pending');
    expect(pipelineRunStatus(mockTaskRunReasons[3])).toBe('Pending');
    expect(pipelineRunStatus(mockTaskRunReasons[4])).toBe('Pending');
  });

  it('Pipelinerun with ConditionCheckFailed status should be skipped', () => {
    expect(pipelineRunStatus(mockTaskRunReasons[5])).toBe('Skipped');
  });
});

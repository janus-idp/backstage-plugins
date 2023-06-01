/* eslint-disable jest/no-identical-title */
import { TaskRunKind } from '../types/taskRun';
import { pipelineRunStatus } from './pipeline-filter-reducer';

const mockPipelineRuns: TaskRunKind[] = [
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
      conditions: [{ type: 'Succeeded', status: 'Unknown', reason: 'StoppedRunFinally' }],
      podName: 'test-pod',
      startTime: '',
    },
  },
  {
    spec: {},
    status: {
      conditions: [{ type: 'Succeeded', status: 'Unknown', reason: 'CancelledRunFinally' }],
      podName: 'test-pod',
      startTime: '',
    },
  },
  {
    spec: {},
    status: {
      conditions: [{ type: 'Succeeded', status: 'Unknown', reason: 'TaskRunCancelled' }],
      podName: 'test-pod',
      startTime: '',
    },
  },
];

const mockPipelineRunReasons: TaskRunKind[] = [
  {
    spec: {},
    status: {
      conditions: [{ type: 'Succeeded', status: 'Unknown', reason: 'PipelineRunStopping' }],
      podName: 'test-pod',
      startTime: '',
    },
  },
  {
    spec: {},
    status: {
      conditions: [{ type: 'Succeeded', status: 'Unknown', reason: 'TaskRunStopping' }],
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

describe('Check PipelineRun Status | Filter Reducer applied to the following:', () => {
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "False"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[0]);
    expect(reducerOutput).toBe('Failed');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "True"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[1]);
    expect(reducerOutput).toBe('Succeeded');
  });
  it('Pipelinerun with second element of condition array with type as "Succeeded" & status as "False"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[2]);
    expect(reducerOutput).toBe('Failed');
  });
  it('Pipelinerun with second element of condition array with type as "Succeeded" & status as "True"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[3]);
    expect(reducerOutput).toBe('Succeeded');
  });
  it('Pipelinerun with second element of condition array with type as "Succeeded" & status as "True" and additional condition with type as "Failure"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[4]);
    expect(reducerOutput).toBe('Succeeded');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "Unknown"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[5]);
    expect(reducerOutput).toBe('Running');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "Unknown" & reason as "StoppedRunFinally"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[6]);
    expect(reducerOutput).toBe('Cancelled');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "Unknown" & reason as "CancelledRunFinally"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[7]);
    expect(reducerOutput).toBe('Cancelled');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & status as "Unknown"', () => {
    const reducerOutput = pipelineRunStatus(mockPipelineRuns[8]);
    expect(reducerOutput).toBe('Cancelled');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & Failing condition', () => {
    expect(pipelineRunStatus(mockPipelineRunReasons[0])).toBe('Failed');
    expect(pipelineRunStatus(mockPipelineRunReasons[1])).toBe('Failed');
  });
  it('Pipelinerun with first element of condition array with type as "Succeeded" & Pending condition', () => {
    expect(pipelineRunStatus(mockPipelineRunReasons[2])).toBe('Pending');
    expect(pipelineRunStatus(mockPipelineRunReasons[3])).toBe('Pending');
    expect(pipelineRunStatus(mockPipelineRunReasons[4])).toBe('Pending');
  });

  it('Pipelinerun with ConditionCheckFailed status should be skipped', () => {
    expect(pipelineRunStatus(mockPipelineRunReasons[5])).toBe('Skipped');
  });
});

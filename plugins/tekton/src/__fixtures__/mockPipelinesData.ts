import {
  Label,
  PipelineRun,
  TaskRun,
} from '@jquad-group/plugin-tekton-pipelines-common';

const recordMock: Record<string, Label> = {
  testKey: { key: 'test-key', value: 'test-value' },
};

export const taskRunMock1: TaskRun = {
  metadata: {
    name: 'taskrun-1',
    namespace: 'sample-go-application-build',
    labels: recordMock,
  },
  status: {
    podName: 'taskrun-1-pod',
    startTime: new Date('2022-10-25T18:42:30Z'),
    completionTime: new Date('2022-10-25T18:47:30Z'),
    duration: 5,
    durationString: '5m',
    steps: [
      {
        container: 'taskrun-container',
        log: 'some log',
        name: 'taskrun-name',
        terminated: {
          duration: 5,
          durationString: '5m',
          finishedAt: new Date('2022-10-25T18:47:30Z'),
          reason: 'Completed',
          startedAt: new Date('2022-10-25T18:42:30Z'),
        },
      },
    ],
    conditions: [
      {
        message: 'Tasks Completed: 4 (Failed: 0, Cancelled 0), Skipped: 1',
        reason: 'Completed',
        status: 'True',
        type: 'Succeeded',
      },
    ],
  },
};

export const taskRunMock2: TaskRun = {
  metadata: {
    name: 'taskrun-2',
    namespace: 'sample-go-application-build',
    labels: recordMock,
  },
  status: {
    podName: 'taskrun-2-pod',
    startTime: new Date('2022-10-25T18:42:30Z'),
    completionTime: new Date('2022-10-25T18:47:30Z'),
    duration: 5,
    durationString: '5m',
    steps: [
      {
        container: 'taskrun-clone',
        log: 'clone',
        name: 'taskrun-name',
        terminated: {
          duration: 5,
          durationString: '5m',
          finishedAt: new Date('2022-10-25T18:47:30Z'),
          reason: 'Completed',
          startedAt: new Date('2022-10-25T18:42:30Z'),
        },
      },
      {
        container: 'taskrun-build',
        log: 'clone',
        name: 'build',
        terminated: {
          duration: 5,
          durationString: '5m',
          finishedAt: new Date('2022-10-25T18:47:30Z'),
          reason: 'Completed',
          startedAt: new Date('2022-10-25T18:42:30Z'),
        },
      },
      {
        container: 'taskrun-test',
        log: 'test',
        name: 'test',
        terminated: {
          duration: 5,
          durationString: '5m',
          finishedAt: new Date('2022-10-25T18:47:30Z'),
          reason: 'Completed',
          startedAt: new Date('2022-10-25T18:42:30Z'),
        },
      },
    ],
    conditions: [
      {
        message: 'Tasks Completed: 4 (Failed: 0, Cancelled 0), Skipped: 1',
        reason: 'Completed',
        status: 'True',
        type: 'Succeeded',
      },
    ],
  },
};

export const pipelineRunMock: PipelineRun = {
  metadata: {
    labels: recordMock,
    name: 'feature-added-catalog-info-xdjk9',
    namespace: 'sample-go-application-build',
  },
  pipelineRunDashboardUrl: 'https://mock.dashboard',
  taskRuns: [taskRunMock1, taskRunMock2],
  status: {
    startTime: new Date('2022-10-25T18:42:30Z'),
    completionTime: new Date('2022-10-25T18:47:30Z'),
    duration: 5,
    durationString: '5m',
    conditions: [
      {
        message: 'Tasks Completed: 4 (Failed: 0, Cancelled 0), Skipped: 1',
        reason: 'Completed',
        status: 'True',
        type: 'Succeeded',
      },
    ],
  },
};

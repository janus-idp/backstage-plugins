import { RawFetchError } from '@backstage/plugin-kubernetes-common';

import { mockKubernetesPlrResponse } from '../__fixtures__/1-pipelinesData';
import { kubernetesObjects } from '../__fixtures__/kubernetesObject';
import { PipelineRunKind } from '../types/pipelineRun';
import {
  calculateDuration,
  getClusters,
  getDuration,
  getTaskStatus,
  getTektonResources,
  pipelineRunDuration,
  totalPipelineRunTasks,
  updateTaskStatus,
} from './tekton-utils';

describe('tekton-utils', () => {
  it('getClusters should return the cluster', () => {
    const k8sObjects = {
      items: [
        {
          cluster: {
            name: 'cluster1',
          },
          podMetrics: [],
          errors: [
            {
              errorType: 'FETCH_ERROR',
              message: 'Could not fetch resources',
            } as RawFetchError,
          ],
          resources: [],
        },
      ],
    };
    const { clusters, errors } = getClusters(k8sObjects);
    expect(clusters).toEqual(['cluster1']);
    expect(errors).toEqual([[{ errorType: 'FETCH_ERROR', message: 'Could not fetch resources' }]]);
  });

  it('getTektonResources should return the tekton resources if exists', () => {
    const plrResources = getTektonResources(0, kubernetesObjects);
    expect(plrResources).toEqual({
      pipelineruns: {
        data: mockKubernetesPlrResponse.pipelineruns,
      },
    });
  });

  it('getTektonResources should not return the tekton resources if does not exists', () => {
    const plrResources = getTektonResources(1, kubernetesObjects);
    expect(plrResources).toEqual({});
  });

  it('totalPipelineRunTasks should return the total number of tasks in a pipeline run', () => {
    const totalTasks = totalPipelineRunTasks(mockKubernetesPlrResponse.pipelineruns[0]);
    expect(totalTasks).toEqual(3);
  });

  it('updateTaskStatus should return the updated task status', () => {
    const updatedTaskStatus = updateTaskStatus(mockKubernetesPlrResponse.pipelineruns[0], [
      mockKubernetesPlrResponse.taskruns[0],
    ]);
    expect(updatedTaskStatus).toEqual({
      PipelineNotStarted: 0,
      Pending: 0,
      Running: 1,
      Succeeded: 0,
      Failed: 0,
      Cancelled: 0,
      Skipped: 0,
    });
  });

  it('updateTaskStatus should return the updated task status if none exists', () => {
    const mockPipelineRun = {
      ...kubernetesObjects.items[0].resources[0].resources[0],
      status: {},
    };
    const updatedTaskStatus = updateTaskStatus(mockPipelineRun, [
      mockKubernetesPlrResponse.taskruns[0],
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

  it('getTaskStatus should return the updated task status', () => {
    const updatedTaskStatus = getTaskStatus(mockKubernetesPlrResponse.pipelineruns[0], [
      mockKubernetesPlrResponse.taskruns[0],
    ]);
    expect(updatedTaskStatus).toEqual({
      PipelineNotStarted: 0,
      Pending: 2,
      Running: 1,
      Succeeded: 0,
      Failed: 0,
      Cancelled: 0,
      Skipped: 0,
    });
  });

  it('getTaskStatus should return the updated task status if none exists', () => {
    const mockPipelineRun = {
      ...kubernetesObjects.items[0].resources[0].resources[0],
      status: {},
    };
    const updatedTaskStatus = getTaskStatus(mockPipelineRun, [
      mockKubernetesPlrResponse.taskruns[0],
    ]);
    expect(updatedTaskStatus).toEqual({
      PipelineNotStarted: 1,
      Pending: 0,
      Running: 0,
      Succeeded: 0,
      Failed: 0,
      Cancelled: 0,
      Skipped: 0,
    });
  });

  it('should return the right duration strings', () => {
    expect(getDuration(0, false)).toBe('less than a sec');
    expect(getDuration(0, true)).toBe('less than a sec');

    expect(getDuration(10, false)).toBe('10s');
    expect(getDuration(10, true)).toBe('10 seconds');

    expect(getDuration(60, false)).toBe('1m');
    expect(getDuration(60, true)).toBe('1 minute');

    expect(getDuration(3600 + 2 * 60 + 3, false)).toBe('1h 2m 3s');
    expect(getDuration(3600 + 2 * 60 + 3, true)).toBe('1 hour 2 minutes 3 seconds');

    expect(getDuration(48 * 3600 + 1, false)).toBe('48h 1s');
    expect(getDuration(48 * 3600 + 1, true)).toBe('48 hours 1 second');
  });

  it('should return definite duration', () => {
    let duration = calculateDuration('2020-05-22T11:57:53Z', '2020-05-22T11:57:57Z');
    expect(duration).toEqual('4s');
    duration = calculateDuration('2020-05-22T11:57:53Z', '2020-05-22T11:57:57Z', true);
    expect(duration).toEqual('4 seconds');
    duration = calculateDuration('2020-05-22T11:57:53Z', '2020-05-22T12:02:20Z');
    expect(duration).toBe('4m 27s');
    duration = calculateDuration('2020-05-22T11:57:53Z', '2020-05-22T12:02:20Z', true);
    expect(duration).toBe('4 minutes 27 seconds');
    duration = calculateDuration('2020-05-22T10:57:53Z', '2020-05-22T12:57:57Z');
    expect(duration).toBe('2h 4s');
  });

  it('should return expect duration for PipelineRun', () => {
    const duration = pipelineRunDuration(mockKubernetesPlrResponse.pipelineruns[0]);
    expect(duration).not.toBeNull();
    expect(duration).toBe('2 minutes 9 seconds');
  });

  it('should return expect duration as - for PipelineRun without start time', () => {
    const mockPipelineRun: PipelineRunKind = {
      ...mockKubernetesPlrResponse.pipelineruns[0],
      status: {
        ...mockKubernetesPlrResponse.pipelineruns[0].status,
        startTime: '',
      },
    };
    const duration = pipelineRunDuration(mockPipelineRun);
    expect(duration).not.toBeNull();
    expect(duration).toBe('-');
  });

  it('should return expect duration as - for PipelineRun without end time', () => {
    const mockPipelineRun: PipelineRunKind = {
      ...mockKubernetesPlrResponse.pipelineruns[0],
      status: {
        ...mockKubernetesPlrResponse.pipelineruns[0].status,
        completionTime: '',
      },
    };
    const duration = pipelineRunDuration(mockPipelineRun);
    expect(duration).not.toBeNull();
    expect(duration).toBe('-');
  });
});

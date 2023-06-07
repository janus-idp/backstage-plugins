import {
  ClusterObjects,
  ObjectsByEntityResponse,
} from '@backstage/plugin-kubernetes-common';

import { pluralize } from '@patternfly/react-core';

import { PipelineRunGVK, TaskRunGVK } from '../models';
import {
  ComputedStatus,
  SucceedConditionReason,
  TaskStatus,
} from '../types/computedStatus';
import { PipelineRunKind } from '../types/pipelineRun';
import { TaskRunKind } from '../types/taskRun';
import { ClusterErrors, TektonResponseData } from '../types/types';
import {
  pipelineRunFilterReducer,
  pipelineRunStatus,
} from './pipeline-filter-reducer';

export const getClusters = (k8sObjects: ObjectsByEntityResponse) => {
  const clusters: string[] = k8sObjects.items.map(
    (item: ClusterObjects) => item.cluster.name,
  );
  const errors: ClusterErrors[] = k8sObjects.items.map(
    (item: ClusterObjects) => item.errors,
  );
  return { clusters, errors };
};

const isTektonResource = (kind: string) =>
  [PipelineRunGVK.kind, TaskRunGVK.kind].includes(kind);

const getResourceType = (kind: string) => {
  switch (kind) {
    case PipelineRunGVK.kind:
      return 'pipelineruns';
    case TaskRunGVK.kind:
      return 'taskruns';
    default:
      return '';
  }
};

export const getTektonResources = (
  cluster: number,
  k8sObjects: ObjectsByEntityResponse,
) =>
  k8sObjects.items?.[cluster]?.resources?.reduce(
    (acc: TektonResponseData, res: any) => {
      if (
        res.type !== 'customresources' ||
        (res.type === 'customresources' && res.resources.length === 0)
      ) {
        return acc;
      }
      const customResKind = res.resources[0].kind;
      return {
        ...acc,
        ...(isTektonResource(customResKind) && {
          [getResourceType(customResKind)]: {
            data: res.resources,
          },
        }),
      };
    },
    {},
  );

export const totalPipelineRunTasks = (pipelinerun: PipelineRunKind): number => {
  if (!pipelinerun?.status?.pipelineSpec) {
    return 0;
  }
  const totalTasks = (pipelinerun.status.pipelineSpec?.tasks || []).length;
  const finallyTasks =
    (pipelinerun.status.pipelineSpec?.finally || []).length ?? 0;
  return totalTasks + finallyTasks;
};

export const getTaskRunsForPipelineRun = (
  pipelinerun: PipelineRunKind,
  taskRuns: TaskRunKind[],
): TaskRunKind[] => {
  const associatedTaskRuns = taskRuns.reduce(
    (acc: TaskRunKind[], taskRun: TaskRunKind) => {
      if (
        taskRun?.metadata?.ownerReferences?.[0]?.name ===
        pipelinerun?.metadata?.name
      ) {
        acc.push(taskRun);
      }
      return acc;
    },
    [],
  );

  return associatedTaskRuns;
};

export const updateTaskStatus = (
  pipelinerun: PipelineRunKind,
  taskRuns: TaskRunKind[],
): TaskStatus => {
  const skippedTaskLength = pipelinerun?.status?.skippedTasks?.length || 0;
  const taskStatus: TaskStatus = {
    PipelineNotStarted: 0,
    Pending: 0,
    Running: 0,
    Succeeded: 0,
    Failed: 0,
    Cancelled: 0,
    Skipped: skippedTaskLength,
  };
  if (!pipelinerun?.status?.taskRuns) {
    return taskStatus;
  }

  taskRuns.forEach((taskRun: TaskRunKind) => {
    const status = taskRun && pipelineRunFilterReducer(taskRun);
    if (status === 'Succeeded') {
      taskStatus[ComputedStatus.Succeeded]++;
    } else if (status === 'Running') {
      taskStatus[ComputedStatus.Running]++;
    } else if (status === 'Failed') {
      taskStatus[ComputedStatus.Failed]++;
    } else if (status === 'Cancelled') {
      taskStatus[ComputedStatus.Cancelled]++;
    } else {
      taskStatus[ComputedStatus.Pending]++;
    }
  });

  return {
    ...taskStatus,
  };
};

export const getTaskStatus = (
  pipelinerun: PipelineRunKind,
  taskRuns: TaskRunKind[],
) => {
  const totalTasks = totalPipelineRunTasks(pipelinerun);
  const plrTaskLength = taskRuns.length;
  const skippedTaskLength = pipelinerun?.status?.skippedTasks?.length || 0;

  const taskStatus: TaskStatus = updateTaskStatus(pipelinerun, taskRuns);

  if (pipelinerun?.status?.taskRuns) {
    const pipelineRunHasFailure = taskStatus[ComputedStatus.Failed] > 0;
    const pipelineRunIsCancelled =
      pipelineRunFilterReducer(pipelinerun) === ComputedStatus.Cancelled;
    const unhandledTasks =
      totalTasks >= plrTaskLength
        ? totalTasks - plrTaskLength - skippedTaskLength
        : totalTasks;

    if (pipelineRunHasFailure || pipelineRunIsCancelled) {
      taskStatus[ComputedStatus.Cancelled] += unhandledTasks;
    } else {
      taskStatus[ComputedStatus.Pending] += unhandledTasks;
    }
  } else if (
    pipelinerun?.status?.conditions?.[0]?.status === 'False' ||
    pipelinerun?.spec.status === SucceedConditionReason.PipelineRunCancelled
  ) {
    taskStatus[ComputedStatus.Cancelled] = totalTasks;
  } else if (
    pipelinerun?.spec.status === SucceedConditionReason.PipelineRunPending
  ) {
    taskStatus[ComputedStatus.Pending] += totalTasks;
  } else {
    taskStatus[ComputedStatus.PipelineNotStarted]++;
  }
  return taskStatus;
};

export const getDuration = (seconds: number, long?: boolean): string => {
  if (seconds === 0) {
    return 'less than a sec';
  }
  let sec = Math.round(seconds);
  let min = 0;
  let hr = 0;
  let duration = '';
  if (sec >= 60) {
    min = Math.floor(sec / 60);
    sec %= 60;
  }
  if (min >= 60) {
    hr = Math.floor(min / 60);
    min %= 60;
  }
  if (hr > 0) {
    duration += long ? pluralize(hr, 'hour', 'hours') : `${hr}h`;
    duration += ' ';
  }
  if (min > 0) {
    duration += long ? pluralize(min, 'minute', 'minutes') : `${min}m`;
    duration += ' ';
  }
  if (sec > 0) {
    duration += long ? pluralize(sec, 'second', 'seconds') : `${sec}s`;
  }

  return duration.trim();
};

export const calculateDuration = (
  startTime: string,
  endTime?: string,
  long?: boolean,
) => {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
  const durationInSeconds = (end - start) / 1000;
  return getDuration(durationInSeconds, long);
};

export const pipelineRunDuration = (run: PipelineRunKind): string => {
  const startTime = run?.status?.startTime;
  const completionTime = run?.status?.completionTime;

  // Duration cannot be computed if start time is missing or a completed/failed pipeline/task has no end time
  if (!startTime || (!completionTime && pipelineRunStatus(run) !== 'Running')) {
    return '-';
  }
  return calculateDuration(startTime, completionTime, true);
};

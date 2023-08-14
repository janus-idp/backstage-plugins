import { ComputedStatus, TaskRunKind } from '@janus-idp/shared-react';

import { TEKTON_PIPELINE_TASK } from '../consts/tekton-const';
import { pipelineRunFilterReducer } from './pipeline-filter-reducer';

export type TaskStep = {
  id: string;
  name: string;
  status: ComputedStatus;
  startedAt?: string;
  endedAt?: string;
};

export const getSortedTaskRuns = (tRuns: TaskRunKind[]): TaskStep[] => {
  if (!tRuns || tRuns.length === 0) {
    return [];
  }
  const taskRuns = Array.from(tRuns).sort((a, b) => {
    if (a.status?.completionTime) {
      return b.status?.completionTime &&
        new Date(a.status?.completionTime ?? '') >
          new Date(b.status.completionTime)
        ? 1
        : -1;
    }
    return b.status?.completionTime ||
      new Date(a.status?.startTime ?? '') > new Date(b.status?.startTime ?? '')
      ? 1
      : -1;
  });
  return (taskRuns?.map(tr => {
    return {
      id: tr.metadata?.name,
      name: tr.metadata?.labels?.[TEKTON_PIPELINE_TASK],
      status: pipelineRunFilterReducer(tr),
      startedAt: tr.status?.startTime,
      endedAt: tr.status?.completionTime,
    };
  }) || []) as TaskStep[];
};

export const getActiveTaskRun = (
  taskRuns: TaskStep[],
  activeTask: string | undefined,
): string | undefined =>
  activeTask
    ? taskRuns.find(taskRun => taskRun?.id === activeTask)?.id
    : taskRuns[taskRuns.length - 1]?.id;

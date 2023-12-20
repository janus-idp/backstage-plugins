import {
  ComputedStatus,
  pipelineRunFilterReducer,
  TaskRunKind,
  TaskRunResults,
  TaskRunResultsAnnotations,
  TaskRunResultsAnnotationValue,
} from '@janus-idp/shared-react';

import {
  TEKTON_PIPELINE_RUN,
  TEKTON_PIPELINE_TASK,
} from '../consts/tekton-const';

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

export const isSbomTaskRun = (tr: TaskRunKind | undefined): boolean =>
  tr?.metadata?.annotations?.[TaskRunResultsAnnotations.KEY] ===
  TaskRunResults.SBOM;

export const getSbomTaskRun = (
  pipelineRunName: string | undefined,
  taskruns: TaskRunKind[],
): TaskRunKind | undefined =>
  taskruns?.find(
    (tr: any) =>
      tr?.metadata?.labels?.[TEKTON_PIPELINE_RUN] === pipelineRunName &&
      isSbomTaskRun(tr),
  );

export const hasExternalLink = (
  sbomTaskRun: TaskRunKind | undefined,
): boolean =>
  sbomTaskRun?.metadata?.annotations?.[TaskRunResultsAnnotations.TYPE] ===
  TaskRunResultsAnnotationValue.EXTERNAL_LINK;

export const getSbomLink = (
  sbomTaskRun: TaskRunKind | undefined,
): string | undefined =>
  (sbomTaskRun?.status?.results || sbomTaskRun?.status?.taskResults)?.find(
    r => r.name === TaskRunResults.SBOM,
  )?.value;

import { PipelineRunKind, TaskRunKind } from '../../types';

export const getTaskRunsForPipelineRun = (
  pipelinerun: PipelineRunKind | null,
  taskRuns: TaskRunKind[],
): TaskRunKind[] => {
  if (!taskRuns || taskRuns.length === 0) {
    return [];
  }
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

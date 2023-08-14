import {
  cancelledColor,
  failureColor,
  pendingColor,
  runningColor,
  skippedColor,
  successColor,
} from '../../consts';
import {
  ComputedStatus,
  PipelineRunKind,
  PipelineTaskWithStatus,
  StatusMessage,
  SucceedConditionReason,
  TaskRunKind,
  TaskStatusTypes,
} from '../../types';
import { getTaskRunsForPipelineRun } from './task-run';

export const getRunStatusColor = (status: string): StatusMessage => {
  switch (status) {
    case ComputedStatus.Succeeded:
      return { message: 'Succeeded', color: successColor };
    case ComputedStatus.Failed:
      return { message: 'Failed', color: failureColor };
    case ComputedStatus.FailedToStart:
      return {
        message: 'PipelineRun failed to start',
        color: failureColor,
      };
    case ComputedStatus.Running:
    case ComputedStatus['In Progress']:
      return { message: 'Running', color: runningColor };

    case ComputedStatus.Skipped:
      return { message: 'Skipped', color: skippedColor };
    case ComputedStatus.Cancelled:
      return { message: 'Cancelled', color: cancelledColor };
    case ComputedStatus.Cancelling:
      return { message: 'Cancelling', color: cancelledColor };
    case ComputedStatus.Idle:
    case ComputedStatus.Pending:
      return { message: 'Pending', color: pendingColor };
    default:
      return {
        message: 'PipelineRun not started yet',
        color: pendingColor,
      };
  }
};

const getDate = (
  run: PipelineRunKind,
  field: 'completionTime' | 'startTime' | 'creationTimestamp',
) => {
  if (field === 'creationTimestamp') {
    return run?.metadata?.creationTimestamp ?? '';
  }
  if (field === 'startTime' || field === 'completionTime') {
    return run?.status?.[field] ?? '';
  }
  return '';
};

const getLatestRun = (
  runs: PipelineRunKind[],
  field: 'completionTime' | 'startTime' | 'creationTimestamp',
) => {
  let latestRun = runs[0];
  for (let i = 1; i < runs.length; i++) {
    latestRun =
      new Date(getDate(runs?.[i], field)) > new Date(getDate(latestRun, field))
        ? runs[i]
        : latestRun;
  }
  return latestRun;
};

export const getLatestPipelineRun = (
  runs: PipelineRunKind[],
  field: string,
): PipelineRunKind | null => {
  if (runs?.length > 0 && field) {
    let latestRun;
    if (
      field === 'completionTime' ||
      field === 'startTime' ||
      field === 'creationTimestamp'
    ) {
      latestRun = getLatestRun(runs, field);
    } else {
      latestRun = runs[runs.length - 1];
    }
    return latestRun;
  }
  return null;
};

const getSucceededStatus = (status: string): ComputedStatus => {
  if (status === 'True') {
    return ComputedStatus.Succeeded;
  } else if (status === 'False') {
    return ComputedStatus.Failed;
  }
  return ComputedStatus.Running;
};

export const pipelineRunStatus = (
  pipelineRun: PipelineRunKind | TaskRunKind | PipelineTaskWithStatus | null,
) => {
  const conditions = pipelineRun?.status?.conditions || [];
  if (conditions.length === 0) return null;

  const succeedCondition = conditions.find((c: any) => c.type === 'Succeeded');
  const cancelledCondition = conditions.find(
    (c: any) => c.reason === 'Cancelled',
  );
  const failedCondition = conditions.find((c: any) => c.reason === 'Failed');

  if (
    [
      SucceedConditionReason.PipelineRunStopped,
      SucceedConditionReason.PipelineRunCancelled,
    ].includes(
      (pipelineRun as PipelineRunKind)?.spec?.status as SucceedConditionReason,
    ) &&
    !cancelledCondition &&
    !failedCondition
  ) {
    return ComputedStatus.Cancelling;
  }

  if (!succeedCondition?.status) {
    return null;
  }

  const status = getSucceededStatus(succeedCondition.status);

  if (succeedCondition.reason && succeedCondition.reason !== status) {
    switch (succeedCondition.reason) {
      case SucceedConditionReason.PipelineRunCancelled:
      case SucceedConditionReason.TaskRunCancelled:
      case SucceedConditionReason.Cancelled:
      case SucceedConditionReason.PipelineRunStopped:
        return ComputedStatus.Cancelled;
      case SucceedConditionReason.PipelineRunStopping:
      case SucceedConditionReason.TaskRunStopping:
        return ComputedStatus.Failed;
      case SucceedConditionReason.CreateContainerConfigError:
      case SucceedConditionReason.ExceededNodeResources:
      case SucceedConditionReason.ExceededResourceQuota:
      case SucceedConditionReason.PipelineRunPending:
        return ComputedStatus.Pending;
      case SucceedConditionReason.ConditionCheckFailed:
        return ComputedStatus.Skipped;
      default:
        return status;
    }
  }
  return status;
};

export const pipelineRunFilterReducer = (
  pipelineRun: PipelineRunKind | TaskRunKind,
): ComputedStatus => {
  const status = pipelineRunStatus(pipelineRun);
  return status || ComputedStatus.Other;
};

export const updateTaskStatus = (
  pipelinerun: PipelineRunKind | null,
  taskRuns: TaskRunKind[],
): TaskStatusTypes => {
  const skippedTaskLength = pipelinerun?.status?.skippedTasks?.length || 0;
  const PLRTaskRuns = getTaskRunsForPipelineRun(pipelinerun, taskRuns);
  const taskStatus: TaskStatusTypes = {
    PipelineNotStarted: 0,
    Pending: 0,
    Running: 0,
    Succeeded: 0,
    Failed: 0,
    Cancelled: 0,
    Skipped: skippedTaskLength,
  };

  if (!PLRTaskRuns || PLRTaskRuns.length === 0) {
    return taskStatus;
  }

  PLRTaskRuns.forEach((taskRun: TaskRunKind) => {
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

export const totalPipelineRunTasks = (
  pipelinerun: PipelineRunKind | null,
): number => {
  if (!pipelinerun?.status?.pipelineSpec) {
    return 0;
  }
  const totalTasks = (pipelinerun.status.pipelineSpec?.tasks || []).length;
  const finallyTasks =
    (pipelinerun.status.pipelineSpec?.finally || []).length ?? 0;
  return totalTasks + finallyTasks;
};

export const getTaskStatus = (
  pipelinerun: PipelineRunKind,
  taskRuns: TaskRunKind[],
) => {
  const totalTasks = totalPipelineRunTasks(pipelinerun);
  const plrTaskLength = taskRuns.length;
  const skippedTaskLength = pipelinerun?.status?.skippedTasks?.length || 0;

  const taskStatus: TaskStatusTypes = updateTaskStatus(pipelinerun, taskRuns);

  if (taskRuns?.length > 0) {
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

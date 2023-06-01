import { ComputedStatus, SucceedConditionReason } from '../types/computedStatus';
import { PipelineRunKind, PipelineTaskWithStatus } from '../types/pipelineRun';
import { TaskRunKind } from '../types/taskRun';

const getSucceededStatus = (status: string): ComputedStatus => {
  if (status === 'True') {
    return ComputedStatus.Succeeded;
  } else if (status === 'False') {
    return ComputedStatus.Failed;
  }
  return ComputedStatus.Running;
};

export const pipelineRunStatus = (
  pipelineRun: PipelineRunKind | TaskRunKind | PipelineTaskWithStatus,
) => {
  const conditions = pipelineRun?.status?.conditions || [];
  if (conditions.length === 0) return null;

  const succeedCondition = conditions.find((c: any) => c.type === 'Succeeded');
  const cancelledCondition = conditions.find((c: any) => c.reason === 'Cancelled');
  const failedCondition = conditions.find((c: any) => c.reason === 'Failed');

  if (
    [
      SucceedConditionReason.PipelineRunStopped,
      SucceedConditionReason.PipelineRunCancelled,
    ].includes((pipelineRun as PipelineRunKind)?.spec?.status as SucceedConditionReason) &&
    !cancelledCondition &&
    !failedCondition
  ) {
    return ComputedStatus.Cancelling;
  }

  if (!succeedCondition || !succeedCondition.status) {
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

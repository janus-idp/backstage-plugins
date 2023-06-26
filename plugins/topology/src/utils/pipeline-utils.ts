import { INSTANCE_LABEL } from '../const';
import { PipelineKind } from '../types/pipeline';
import {
  Condition,
  PipelineRunKind,
  PipelinesData,
} from '../types/pipelineRun';
import { K8sResponseData, K8sWorkloadResource } from '../types/types';

export enum ComputedStatus {
  Cancelling = 'Cancelling',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Running = 'Running',
  'In Progress' = 'In Progress',
  FailedToStart = 'FailedToStart',
  PipelineNotStarted = 'PipelineNotStarted',
  Skipped = 'Skipped',
  Cancelled = 'Cancelled',
  Pending = 'Pending',
  Idle = 'Idle',
  Other = '-',
}

export enum SucceedConditionReason {
  PipelineRunCancelled = 'StoppedRunFinally',
  PipelineRunStopped = 'CancelledRunFinally',
  TaskRunCancelled = 'TaskRunCancelled',
  Cancelled = 'Cancelled',
  PipelineRunStopping = 'PipelineRunStopping',
  PipelineRunPending = 'PipelineRunPending',
  TaskRunStopping = 'TaskRunStopping',
  CreateContainerConfigError = 'CreateContainerConfigError',
  ExceededNodeResources = 'ExceededNodeResources',
  ExceededResourceQuota = 'ExceededResourceQuota',
  ConditionCheckFailed = 'ConditionCheckFailed',
}

export const pipelineRunStatus = (
  pipelineRun: PipelineRunKind,
): ComputedStatus | undefined => {
  const conditions = pipelineRun?.status?.conditions ?? [];
  if (conditions.length === 0) return undefined;

  const succeedCondition = conditions.find(
    (c: Condition) => c.type === 'Succeeded',
  );
  const cancelledCondition = conditions.find(
    (c: Condition) => c.reason === 'Cancelled',
  );

  if (
    [
      SucceedConditionReason.PipelineRunStopped,
      SucceedConditionReason.PipelineRunCancelled,
    ].includes(pipelineRun.spec?.status as SucceedConditionReason) &&
    !cancelledCondition
  ) {
    return ComputedStatus.Cancelling;
  }

  if (!succeedCondition?.status) {
    return undefined;
  }

  let status;

  if (succeedCondition.status === 'True') status = ComputedStatus.Succeeded;
  else if (succeedCondition.status === 'False') status = ComputedStatus.Failed;
  else status = ComputedStatus.Running;

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

const byCreationTime = (left: any, right: any): number => {
  const leftCreationTime = new Date(
    left?.metadata?.creationTimestamp || Date.now(),
  );
  const rightCreationTime = new Date(
    right?.metadata?.creationTimestamp || Date.now(),
  );
  return rightCreationTime.getTime() - leftCreationTime.getTime();
};

export const getPipelineRunsForPipeline = (
  pipeline: PipelineKind,
  resources: K8sResponseData,
): PipelineRunKind[] => {
  if (!resources.pipelineruns?.data?.length) {
    return [];
  }
  const pipelineRunsData = resources.pipelineruns.data as PipelineRunKind[];
  const PIPELINE_RUN_LABEL = 'tekton.dev/pipeline';
  const pipelineName = pipeline.metadata?.name;
  return pipelineRunsData
    .filter((pr: PipelineRunKind) => {
      return (
        pipelineName ===
        (pr.spec?.pipelineRef?.name ||
          pr?.metadata?.labels?.[PIPELINE_RUN_LABEL])
      );
    })
    .sort(byCreationTime);
};

export const getPipelinesAndPipelineRunsForResource = (
  resource: K8sWorkloadResource,
  resources: K8sResponseData,
): PipelinesData | undefined => {
  if (!resources.pipelines?.data?.length) {
    return undefined;
  }
  const pipelinesData = resources.pipelines.data as PipelineKind[];
  const resourceInstanceName =
    resource.metadata?.labels?.[INSTANCE_LABEL] || null;
  if (!resourceInstanceName) return undefined;
  const resourcePipeline = pipelinesData.find(
    pl => pl.metadata?.labels?.[INSTANCE_LABEL] === resourceInstanceName,
  );
  if (!resourcePipeline) return undefined;
  return {
    pipelines: [resourcePipeline],
    pipelineRuns: getPipelineRunsForPipeline(resourcePipeline, resources) ?? [],
  };
};

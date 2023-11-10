export enum TerminatedReasons {
  Completed = 'Completed',
}

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

export type StatusMessage = {
  message: string;
  color: string;
};

export type TaskStatusTypes = {
  PipelineNotStarted: number;
  Pending: number;
  Running: number;
  Succeeded: number;
  Cancelled: number;
  Failed: number;
  Skipped: number;
};

export const computedStatus: { [key: string]: string | ComputedStatus } = {
  All: '',
  Cancelling: ComputedStatus.Cancelling,
  Succeeded: ComputedStatus.Succeeded,
  Failed: ComputedStatus.Failed,
  Running: ComputedStatus.Running,
  'In Progress': ComputedStatus['In Progress'],
  FailedToStart: ComputedStatus.FailedToStart,
  PipelineNotStarted: ComputedStatus.PipelineNotStarted,
  Skipped: ComputedStatus.Skipped,
  Cancelled: ComputedStatus.Cancelled,
  Pending: ComputedStatus.Pending,
  Idle: ComputedStatus.Idle,
  Other: ComputedStatus.Other,
};

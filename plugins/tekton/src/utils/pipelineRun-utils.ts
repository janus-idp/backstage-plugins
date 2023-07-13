import { cloneDeep, each, find, get, isEmpty, isFinite, trim } from 'lodash';

import {
  ComputedStatus,
  SucceedConditionReason,
} from '../types/computedStatus';
import { PipelineTask } from '../types/pipeline';
import {
  PipelineRunKind,
  PipelineTaskWithStatus,
  PLRTaskRuns,
} from '../types/pipelineRun';
import { TaskRunKind, TaskStatus } from '../types/taskRun';
import { pipelineRunStatus } from './pipeline-filter-reducer';

// Conversions between units and milliseconds
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const units = { w, d, h, m, s };

export const formatPrometheusDuration = (ms: number) => {
  if (!isFinite(ms) || ms < 0) {
    return '';
  }
  let remaining = ms;
  let str = '';
  each(units, (factor, unit) => {
    const n = Math.floor(remaining / factor);
    if (n > 0) {
      str += `${n}${unit} `;
      remaining -= n * factor;
    }
  });
  return trim(str);
};

export const taskConditions = {
  hasFromDependency: (task: PipelineTask): boolean =>
    !!task?.resources?.inputs?.[0].from,
  hasRunAfterDependency: (task: PipelineTask): boolean =>
    !!task?.runAfter && task?.runAfter?.length > 0,
};

const getLatestRunBasedOnCreationTimestamp = (
  runs: PipelineRunKind[],
  latestRun: PipelineRunKind,
) => {
  let temp = cloneDeep(latestRun);
  for (let i = 1; i < runs.length; i++) {
    temp =
      new Date(runs?.[i]?.metadata?.creationTimestamp ?? '') >
      new Date(latestRun?.metadata?.creationTimestamp ?? '')
        ? runs[i]
        : temp;
  }
  return temp;
};

const getLatestRunNotBasedOnCreationTimestamp = (
  runs: PipelineRunKind[],
  latestRun: PipelineRunKind,
  field: 'completionTime' | 'startTime',
) => {
  let temp = cloneDeep(latestRun);
  for (let i = 1; i < runs.length; i++) {
    temp =
      new Date(runs?.[i]?.status?.[field] ?? '') >
      new Date(latestRun?.status?.[field] ?? '')
        ? runs[i]
        : temp;
  }
  return temp;
};

export const getLatestPipelineRun = (
  runs: PipelineRunKind[],
  field: string,
): PipelineRunKind | null => {
  if (runs?.length > 0 && field) {
    let latestRun = runs[0];
    if (field === 'creationTimestamp') {
      latestRun = getLatestRunBasedOnCreationTimestamp(runs, latestRun);
    } else if (field === 'startTime' || field === 'completionTime') {
      latestRun = getLatestRunNotBasedOnCreationTimestamp(
        runs,
        latestRun,
        field,
      );
    } else {
      latestRun = runs[runs.length - 1];
    }
    return latestRun;
  }
  return null;
};

export const getPipelineRun = (
  runs: PipelineRunKind[],
  name: string,
): PipelineRunKind | null => {
  if (runs?.length > 0 && name) {
    return runs.find(run => run?.metadata?.name === name) ?? null;
  }
  return null;
};

const getStatusReason = (reason: string | undefined) => {
  switch (reason) {
    case SucceedConditionReason.PipelineRunCancelled:
      return ComputedStatus.Cancelled;
    case SucceedConditionReason.PipelineRunPending:
      return ComputedStatus.Idle;
    default:
      return ComputedStatus.Failed;
  }
};

const appendTaskDuration = (mTask: PipelineTaskWithStatus) => {
  const task = cloneDeep(mTask);
  if (mTask?.status?.completionTime && mTask?.status?.startTime) {
    const date =
      new Date(mTask.status.completionTime).getTime() -
      new Date(mTask.status.startTime).getTime();
    task.status = {
      ...mTask.status,
      duration: formatPrometheusDuration(date),
    };
  }
  return task;
};

const appendTaskStatus = (mTask: PipelineTaskWithStatus) => {
  let task = cloneDeep(mTask);
  if (!mTask.status) {
    task = {
      ...mTask,
      status: { reason: ComputedStatus.Pending, conditions: [] },
    };
  } else if (mTask.status && mTask.status.conditions) {
    task.status.reason = pipelineRunStatus(mTask) || ComputedStatus.Pending;
  } else if (mTask.status && !mTask.status.reason) {
    task.status.reason = ComputedStatus.Pending;
  }
  return task;
};

export const appendPipelineRunStatus = (
  pipelineRun: PipelineRunKind,
  taskRuns: PLRTaskRuns,
  isFinallyTasks = false,
) => {
  const tasks =
    (isFinallyTasks
      ? pipelineRun.status?.pipelineSpec?.finally
      : pipelineRun.status?.pipelineSpec?.tasks) || [];

  return tasks?.map(task => {
    if (!pipelineRun.status) {
      return task as PipelineTaskWithStatus;
    }
    if (isEmpty(taskRuns)) {
      return {
        ...task,
        status: {
          reason: getStatusReason(pipelineRun?.status?.conditions?.[0].reason),
        },
      } as PipelineTaskWithStatus;
    }
    let mTask = {
      ...task,
      status: get(find(taskRuns, { pipelineTaskName: task.name }), 'status'),
    } as PipelineTaskWithStatus;
    // append task duration
    mTask = appendTaskDuration(mTask);
    // append task status
    mTask = appendTaskStatus(mTask);
    return mTask;
  });
};

export const getPLRTaskRuns = (
  taskRuns: TaskRunKind[],
  pipelineRun: string | undefined,
): PLRTaskRuns => {
  const filteredTaskRuns = taskRuns.filter(
    tr => tr?.metadata?.labels?.['tekton.dev/pipelineRun'] === pipelineRun,
  );
  return filteredTaskRuns.reduce((acc: any, taskRun: TaskRunKind) => {
    const temp = {
      [`${taskRun?.metadata?.name}`]: {
        pipelineTaskName:
          taskRun?.metadata?.labels?.['tekton.dev/pipelineTask'],
        status: taskRun?.status,
      },
    };
    // eslint-disable-next-line no-param-reassign
    acc = { ...acc, ...temp };
    return acc;
  }, {});
};

export const pipelineRunFilterReducer = (
  pipelineRun: PipelineRunKind,
): ComputedStatus => {
  const status = pipelineRunStatus(pipelineRun);
  return status || ComputedStatus.Other;
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
    duration += long ? `${hr} hour` : `${hr}h`;
    duration += ' ';
  }
  if (min > 0) {
    duration += long ? `${min} minute` : `${min}m`;
    duration += ' ';
  }
  if (sec > 0) {
    duration += long ? `${sec} second` : `${sec}s`;
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

export const getTaskStatus = (
  pipelineRun: PipelineRunKind,
  task: PipelineTaskWithStatus,
) => {
  let taskStatus: TaskStatus = {
    reason: ComputedStatus.Idle,
  };

  const computedStatus = pipelineRunFilterReducer(pipelineRun);
  const isSkipped = !!(
    task &&
    pipelineRun?.status?.skippedTasks?.some(
      (t: { name: string }) => t.name === task.name,
    )
  );

  if (task?.status) {
    taskStatus = task.status as TaskStatus;
  }
  if (
    computedStatus === ComputedStatus.Failed ||
    computedStatus === ComputedStatus.Cancelled
  ) {
    if (
      task?.status?.reason === ComputedStatus.Idle ||
      task?.status?.reason === ComputedStatus.Pending
    ) {
      taskStatus.reason = ComputedStatus.Cancelled;
    }
  }
  if (isSkipped) {
    taskStatus.reason = ComputedStatus.Skipped;
  }
  return taskStatus;
};

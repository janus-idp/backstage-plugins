import { ComputedStatus, TerminatedReasons } from '@janus-idp/shared-react';

import { StepStatus, TaskStatus, TaskStatusStep } from '../types/taskRun';
import { calculateDuration } from './tekton-utils';

const getMatchingStepDuration = (matchingStep?: TaskStatusStep) => {
  if (!matchingStep) return '';

  if (matchingStep.terminated) {
    return calculateDuration(
      matchingStep.terminated.startedAt,
      matchingStep.terminated.finishedAt,
    );
  }

  if (matchingStep.running) {
    return calculateDuration(matchingStep.running.startedAt);
  }

  return '';
};

const getMatchingStep = (
  step: { name: string },
  status: TaskStatus,
): TaskStatusStep | undefined => {
  const statusSteps: TaskStatusStep[] = status.steps || [];
  return statusSteps.find(statusStep => {
    // In rare occasions the status step name is prefixed with `step-`
    // This is likely a bug but this workaround will be temporary as it's investigated separately
    return (
      statusStep.name === step.name || statusStep.name === `step-${step.name}`
    );
  });
};

export const createStepStatus = (
  step: { name: string },
  status: TaskStatus,
): StepStatus => {
  let stepRunStatus = ComputedStatus.PipelineNotStarted;
  let duration = null;

  if (!status?.reason) {
    stepRunStatus = ComputedStatus.Cancelled;
  } else if (status.reason === ComputedStatus['In Progress']) {
    // In progress, try to get granular statuses
    const matchingStep = getMatchingStep(step, status);

    if (!matchingStep) {
      stepRunStatus = ComputedStatus.Pending;
    } else if (matchingStep.terminated) {
      stepRunStatus =
        matchingStep.terminated.reason === TerminatedReasons.Completed
          ? ComputedStatus.Succeeded
          : ComputedStatus.Failed;
      duration = getMatchingStepDuration(matchingStep);
    } else if (matchingStep.running) {
      stepRunStatus = ComputedStatus['In Progress'];
      duration = getMatchingStepDuration(matchingStep);
    } else if (matchingStep.waiting) {
      stepRunStatus = ComputedStatus.Pending;
    }
  } else {
    // Not in progress, just use the run status reason
    stepRunStatus = status.reason;

    duration =
      getMatchingStepDuration(getMatchingStep(step, status)) || status.duration;
  }

  return {
    duration,
    name: step.name,
    status: stepRunStatus as any,
  };
};

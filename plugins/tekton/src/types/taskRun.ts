import { RunStatus } from '@patternfly/react-topology';

import { ComputedStatus, TerminatedReasons } from '@janus-idp/shared-react';

export type StepStatus = {
  duration: string | null | undefined;
  name: string;
  status: RunStatus;
};

export type TaskStatusStep = {
  name: string;
  running?: { startedAt: string };
  terminated?: {
    finishedAt: string;
    reason: TerminatedReasons;
    startedAt: string;
  };
  waiting?: {};
};

export type TaskStatus = {
  reason: ComputedStatus;
  duration?: string;
  steps?: TaskStatusStep[];
};

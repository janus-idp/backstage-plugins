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

export enum TaskRunResultsAnnotations {
  KEY = 'task.results.key',
  TYPE = 'task.results.type',
  LOCATION = 'task.results.location',
  CONTAINER = 'task.results.container',
  FORMAT = 'task.results.format',
}

export enum TaskRunResultsTypeValue {
  EC = 'ec',
  EXTERNAL_LINK = 'external-link',
  ROXCTL_IMAGE_SCAN = 'roxctl-image-scan',
  ROXCTL_IMAGE_CHECK = 'roxctl-image-check',
  ROXCTL_DEPLOYMENT_CHECK = 'roxctl-deployment-check',
}

export enum TaskRunResultsFormatValue {
  JSON = 'application/json',
  YAML = 'application/yaml',
  TEXT = 'application/text',
}

export enum TaskRunResultsLocationValue {
  LOGS = 'logs',
  RESULTS = 'results',
}

export enum TaskRunResultsKeyValue {
  SBOM = 'LINK_TO_SBOM',
  SCAN_OUTPUT = 'SCAN_OUTPUT',
}

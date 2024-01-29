import { V1Pod } from '@kubernetes/client-node';

import { ComputedStatus, TaskRunKind } from '@janus-idp/shared-react';

export enum ENTERPRISE_CONTRACT_POLICY_STATUS {
  failed = 'Failed',
  successes = 'Success',
  warnings = 'Warning',
}

export enum TaskType {
  sbom = 'sbom',
  ec = 'ec',
  acsImageScan = 'acsImageScan',
  acsImageCheck = 'acsImageCheck',
  acsDeploymentCheck = 'acsDeploymentCheck',
}

export type OutputGroup = {
  [key in TaskType]?: {
    taskRun: TaskRunKind | undefined;
    pod: V1Pod | undefined;
    loading: boolean;
    data: string | object | any;
  };
} & {
  results: {
    status: ComputedStatus | null;
    loading: boolean;
    data: {
      name: string;
      value: string;
    }[];
  };
};

export type OutputTaskRunGroup = {
  [key in `${TaskType}TaskRun`]?: TaskRunKind;
};
export type OutputPodGroup = { [key in `${TaskType}Pod`]?: V1Pod };

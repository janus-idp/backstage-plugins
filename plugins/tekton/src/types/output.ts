import { ECPolicy } from '@aonic-ui/pipelines/dist/esm/types/components/Output/types';
import { V1Pod } from '@kubernetes/client-node';

import { ComputedStatus, TaskRunKind } from '@janus-idp/shared-react';

export enum ENTERPRISE_CONTRACT_POLICY_STATUS {
  failed = 'Failed',
  successes = 'Success',
  warnings = 'Warning',
}
export type EnterpriseContractPolicy = {
  title: string;
  description: string;
  status: ENTERPRISE_CONTRACT_POLICY_STATUS;
  timestamp?: string;
  component?: string;
  msg?: string;
  collection?: string[];
  solution?: string;
};

export type EnterpriseContractRule = {
  metadata?: {
    title: string;
    description: string;
    collections: string[];
    code: string;
    effective_on?: string;
    solution?: string;
  };
  msg: string;
};

export type ComponentEnterpriseContractResult = {
  name: string;
  success: boolean;
  containerImage: string;
  violations?: EnterpriseContractRule[];
  successes?: EnterpriseContractRule[];
  warnings?: EnterpriseContractRule[];
  signatures?: {
    keyid: string;
    metadata: {
      predicateBuildType: string;
      predicateType: string;
      type: string;
    };
    sig: string;
  }[];
};
export type EnterpriseContractResult = {
  components: ComponentEnterpriseContractResult[];
  key?: string;
  policy?: ECPolicy;
  success?: boolean;
  Error?: string;
};

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

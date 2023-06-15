import {
  V1ConfigMap,
  V1ObjectMeta,
  V1PersistentVolumeClaimTemplate,
  V1Secret,
} from '@kubernetes/client-node';

import {
  Condition,
  PipelineTaskParam,
  PipelineTaskRef,
  TektonResource,
  TektonResultsRun,
  TektonTaskSpec,
} from './pipeline';
import { PLRTaskRunStep } from './pipelineRun';

export type VolumeTypePVC = {
  claimName: string;
};

export type TaskRunWorkspace = {
  name: string;
  volumeClaimTemplate?: V1PersistentVolumeClaimTemplate;
  persistentVolumeClaim?: VolumeTypePVC;
  configMap?: V1ConfigMap;
  emptyDir?: {};
  secret?: V1Secret;
  subPath?: string;
};

export type TaskRunStatus = {
  completionTime?: string;
  conditions?: Condition[];
  podName?: string;
  startTime?: string;
  steps?: PLRTaskRunStep[];
  taskResults?: TektonResultsRun[];
};

export type TaskRunKind = {
  apiVersion?: string;
  kind?: string;
  metadata?: V1ObjectMeta;
  spec: {
    taskRef?: PipelineTaskRef;
    taskSpec?: TektonTaskSpec;
    serviceAccountName?: string;
    params?: PipelineTaskParam[];
    resources?: TektonResource[] | {};
    timeout?: string;
    workspaces?: TaskRunWorkspace[];
  };
  status?: TaskRunStatus;
};

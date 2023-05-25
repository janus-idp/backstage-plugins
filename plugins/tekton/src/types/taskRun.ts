import {
  V1ConfigMap,
  V1ObjectMeta,
  V1PersistentVolumeClaimTemplate,
  V1Secret,
} from '@kubernetes/client-node';
import { RunStatus } from '@patternfly/react-topology';
import { ComputedStatus, TerminatedReasons } from './computedStatus';
import {
  Condition,
  PipelineTaskParam,
  PipelineTaskRef,
  TektonResource,
  TektonResultsRun,
  TektonTaskSpec,
} from './pipeline';
import { PLRTaskRunStep } from './pipelineRun';

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

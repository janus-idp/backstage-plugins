import { V1ObjectMeta } from '@kubernetes/client-node';

import {
  Condition,
  PipelineSpec,
  PipelineTask,
  TektonResultsRun,
  TektonTaskSpec,
} from './pipeline';

export type PLRTaskRunStep = {
  container: string;
  imageID?: string;
  name: string;
  waiting?: {
    reason: string;
  };
  running?: {
    startedAt: string;
  };
  terminated?: {
    containerID: string;
    exitCode: number;
    finishedAt: string;
    reason: string;
    startedAt: string;
    message?: string;
  };
};

export type PipelineRunParam = {
  name: string;
  value: string | string[];
  input?: string;
  output?: string;
  resource?: object;
};

export type PipelineRunWorkspace = {
  name: string;
  [volumeType: string]: {};
};

export type PipelineRunEmbeddedResourceParam = { name: string; value: string };
export type PipelineRunEmbeddedResource = {
  name: string;
  resourceSpec: {
    params: PipelineRunEmbeddedResourceParam[];
    type: string;
  };
};
export type PipelineRunReferenceResource = {
  name: string;
  resourceRef: {
    name: string;
  };
};
export type PipelineRunResource = PipelineRunReferenceResource | PipelineRunEmbeddedResource;

export type PLRTaskRunData = {
  pipelineTaskName: string;
  status?: {
    completionTime?: string;
    conditions: Condition[];
    podName: string;
    startTime: string;
    steps?: PLRTaskRunStep[];
    taskSpec?: TektonTaskSpec;
    taskResults?: { name: string; value: string; type?: string }[];
  };
};

export type PLRTaskRuns = {
  [taskRunName: string]: PLRTaskRunData;
};

export type PipelineRunStatus = {
  succeededCondition?: string;
  creationTimestamp?: string;
  conditions?: Condition[];
  startTime?: string;
  completionTime?: string;
  taskRuns?: PLRTaskRuns;
  pipelineSpec: PipelineSpec;
  skippedTasks?: {
    name: string;
  }[];
  pipelineResults?: TektonResultsRun[];
};

export type PipelineRunKind = {
  apiVersion?: string;
  kind?: string;
  metadata?: V1ObjectMeta;
  spec: {
    pipelineRef?: { name: string };
    pipelineSpec?: PipelineSpec;
    params?: PipelineRunParam[];
    workspaces?: PipelineRunWorkspace[];
    resources?: PipelineRunResource[];
    serviceAccountName?: string;
    timeout?: string;
    status?: string;
  };
  status?: PipelineRunStatus;
};

export type PipelineTaskWithStatus = PipelineTask & {
  status: {
    reason: string;
    completionTime?: string;
    conditions: Condition[];
    podName?: string;
    startTime?: string;
    steps?: PLRTaskRunStep[];
    taskSpec?: TektonTaskSpec;
    taskResults?: { name: string; value: string }[];
    duration?: string;
  };
};

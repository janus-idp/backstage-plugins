import { V1ObjectMeta } from '@kubernetes/client-node';

export type TektonParam = {
  default?: string | string[];
  description?: string;
  name: string;
  type?: string;
};

export type TektonResource = {
  name: string;
  optional?: boolean;
  type: string;
};

export type TektonWorkspace = {
  name: string;
  description?: string;
  mountPath?: string;
  readOnly?: boolean;
  optional?: boolean;
};

export type TektonResourceGroup<ResourceType> = {
  inputs?: ResourceType[];
  outputs?: ResourceType[];
};

export type TektonTaskSteps = {
  name: string;
  args?: string[];
  command?: string[];
  image?: string;
  resources?: {}[] | {};
  env?: { name: string; value?: string }[];
  script?: string;
  workingDir?: string;
  volumeMounts?: { name: string; mountPath: string }[];
};

export type TaskResult = {
  name: string;
  description?: string;
};

export type TektonTaskSpec = {
  metadata?: {};
  description?: string;
  steps: TektonTaskSteps[];
  params?: TektonParam[];
  resources?: TektonResourceGroup<TektonResource>;
  results?: TaskResult[];
  workspaces?: TektonWorkspace[];
};

export type TektonResultsRun = {
  name: string;
  type?: string;
  value: string;
};

export type PipelineTaskRef = {
  kind?: string;
  name: string;
};

export type PipelineTaskWorkspace = {
  name: string;
  workspace: string;
  optional?: boolean;
};

export type PipelineTaskResource = {
  name: string;
  resource?: string;
  from?: string[];
};

export type PipelineTaskParam = {
  name: string;
  value: any;
};

export type WhenExpression = {
  input: string;
  operator: string;
  values: string[];
};

export type PipelineResult = {
  name: string;
  value: string;
  description?: string;
};

export type PipelineTask = {
  name: string;
  params?: PipelineTaskParam[];
  resources?: TektonResourceGroup<PipelineTaskResource>;
  runAfter?: string[];
  taskRef?: PipelineTaskRef;
  taskSpec?: TektonTaskSpec;
  when?: WhenExpression[];
  workspaces?: PipelineTaskWorkspace[];
};

export type PipelineSpec = {
  params?: TektonParam[];
  resources?: TektonResource[];
  serviceAccountName?: string;
  tasks: PipelineTask[];
  workspaces?: TektonWorkspace[];
  finally?: PipelineTask[];
  results?: PipelineResult[];
};

export type Condition = {
  type: string;
  status: string;
  reason?: string;
  message?: string;
  lastTransitionTime?: string;
};

export type PipelineKind = {
  apiVersion?: string;
  kind?: string;
  metadata?: V1ObjectMeta;
  spec: PipelineSpec;
};

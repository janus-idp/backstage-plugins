import { GroupVersionKind, tektonGroupColor } from './types/types';

export const PipelineRunGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'tekton.dev',
  kind: 'PipelineRun',
};

export const PipelineRunModel = {
  ...PipelineRunGVK,
  abbr: 'PLR',
  color: tektonGroupColor,
};

export const TaskRunGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'tekton.dev',
  kind: 'TaskRun',
};

export enum ModelsPlural {
  pipelineruns = 'pipelineruns',
  taskruns = 'taskruns',
  pods = 'pods',
}

export const tektonResourceModels: { [key: string]: GroupVersionKind } = {
  [ModelsPlural.pipelineruns]: PipelineRunGVK,
  [ModelsPlural.taskruns]: TaskRunGVK,
};

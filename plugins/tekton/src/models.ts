import { chart_color_green_400 as tektonGroupColor } from '@patternfly/react-tokens/dist/js/chart_color_green_400';

import { GroupVersionKind } from './types/types';

const color = tektonGroupColor.value;

export const PipelineRunGVK: GroupVersionKind = {
  apiVersion: 'v1beta1',
  apiGroup: 'tekton.dev',
  kind: 'PipelineRun',
};

export const PipelineRunModel = {
  ...PipelineRunGVK,
  abbr: 'PLR',
  color,
};

export const TaskRunGVK: GroupVersionKind = {
  apiVersion: 'v1beta1',
  apiGroup: 'tekton.dev',
  kind: 'TaskRun',
};

export enum ModelsPlural {
  pipelineruns = 'pipelineruns',
  taskruns = 'taskruns',
}

export const tektonResourceModels: { [key: string]: GroupVersionKind } = {
  [ModelsPlural.pipelineruns]: PipelineRunGVK,
  [ModelsPlural.taskruns]: TaskRunGVK,
};

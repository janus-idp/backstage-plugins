import { chart_color_green_400 as tektonGroupColor } from '@patternfly/react-tokens/dist/js/chart_color_green_400';

import { GroupVersionKind, Model } from './types/types';

const color = tektonGroupColor.value;

export const PipelineRunGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'tekton.dev',
  kind: 'PipelineRun',
};

export const PipelineRunModel: Model = {
  ...PipelineRunGVK,
  abbr: 'PLR',
  color,
  plural: 'pipelineruns',
  labelPlural: 'PipelineRuns',
};

export const PipelineGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'tekton.dev',
  kind: 'Pipeline',
};

export const PipelineModel: Model = {
  ...PipelineGVK,
  abbr: 'PL',
  color,
  plural: 'pipelines',
  labelPlural: 'Pipelines',
};

export const TaskRunGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'tekton.dev',
  kind: 'TaskRun',
};

export const TaskRunModel: Model = {
  ...TaskRunGVK,
  abbr: 'TR',
  color,
  plural: 'taskruns',
  labelPlural: 'TaskRuns',
};

export enum ModelsPlural {
  pipelineruns = 'pipelineruns',
  pipelines = 'pipelines',
  taskruns = 'taskruns',
}

export const tektonResourceModels: { [key: string]: GroupVersionKind } = {
  [ModelsPlural.pipelineruns]: PipelineRunGVK,
  [ModelsPlural.taskruns]: TaskRunGVK,
  [ModelsPlural.pipelines]: PipelineGVK,
};

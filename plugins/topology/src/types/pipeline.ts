import {
  PipelineKind,
  PipelineRunKind,
  TaskRunKind,
} from '@janus-idp/shared-react';

export type PipelinesData = {
  pipelines: PipelineKind[];
  pipelineRuns: PipelineRunKind[];
  taskRuns: TaskRunKind[];
};

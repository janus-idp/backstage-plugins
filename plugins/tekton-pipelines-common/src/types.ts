/* ignore lint error for internal dependencies */
/* eslint-disable */
import { Entity } from '@backstage/catalog-model';
/* eslint-enable */

export interface PipelineRunsByEntityRequest {
  entity: Entity;
}

export interface PipelineRunsByEntityResponse {
  items: PipelineRun[];
}

export interface Cluster {
  name: string;
  pipelineRuns: PipelineRun[];
  error: string;
}

export interface PipelineRun {
  metadata: {
    name: string;
    namespace: string;
    labels: Record<string, Label>;
  };
  pipelineRunDashboardUrl: string;
  taskRuns: Array<TaskRun>;
  status: {
    conditions: [Condition];
    startTime: Date;
    completionTime: Date;
    duration: number;
    durationString: string;
  };
}

export interface TaskRun {
  metadata: {
    name: string;
    namespace: string;
    labels: Record<string, Label>;
  };
  status: {
    conditions: [Condition];
    podName: string;
    steps: Array<Step>;
    startTime: Date;
    completionTime: Date;
    duration: number;
    durationString: string;
  };
}

export interface Label {
  key: string;
  value: string;
}

export interface Step {
  container: string;
  name: string;
  terminated: Terminated;
  log: string;
}

export interface Terminated {
  startedAt: Date;
  finishedAt: Date;
  duration: number;
  durationString: string;
  reason: string;
}

export interface Condition {
  reason: string;
  type: string;
  status: string;
  message: string;
}

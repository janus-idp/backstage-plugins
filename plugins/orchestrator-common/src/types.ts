import { Specification } from '@severlessworkflow/sdk-typescript';
import { JSONSchema7 } from 'json-schema';
import { OpenAPIV3 } from 'openapi-types';

import { ProcessInstanceStateValues } from './models';

type Id<T> = { [P in keyof T]: T[P] };

type OmitDistributive<T, K extends PropertyKey> = T extends any
  ? T extends object
    ? Id<OmitRecursively<T, K>>
    : T
  : never;

export type OmitRecursively<T, K extends PropertyKey> = Omit<
  { [P in keyof T]: OmitDistributive<T[P], K> },
  K
>;

export type WorkflowDefinition = OmitRecursively<
  Specification.Workflow,
  'normalize'
>;

export interface WorkflowItem {
  uri: string;
  definition: WorkflowDefinition;
}

export type WorkflowListResult = {
  items: WorkflowItem[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type WorkflowOverviewListResult = {
  items: WorkflowOverview[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type WorkflowFormat = 'yaml' | 'json';

export interface WorkflowSample {
  id: string;
  url: string;
}

export interface WorkflowSpecFile {
  path: string;
  content: OpenAPIV3.Document;
}
export interface WorkflowDataInputSchemaResponse {
  workflowItem: WorkflowItem;
  schemas: JSONSchema7[];
}

export interface WorkflowExecutionResponse {
  id: string;
}

export enum WorkflowCategory {
  ASSESSMENT = 'assessment',
  INFRASTRUCTURE = 'infrastructure',
}

export interface WorkflowOverview {
  workflowId: string;
  name?: string;
  uri?: string;
  lastTriggeredMs?: number;
  lastRunStatus?: ProcessInstanceStateValues;
  category?: string;
  avgDurationMs?: number;
  description?: string;
}

export interface WorkflowInfo {
  id: string;
  type?: string;
  name?: string;
  version?: string;
  annotations?: string[];
  description?: string;
  inputSchema?: JSONSchema7;
  endpoint?: string;
  serviceUrl?: string;
  roles?: string[];
  source?: string;
  metadata?: Map<string, string>;
  nodes?: Node[];
}

export interface Node {
  id: string;
  type?: string;
  name?: string;
  uniqueId?: string;
  nodeDefinitionId?: string;
}

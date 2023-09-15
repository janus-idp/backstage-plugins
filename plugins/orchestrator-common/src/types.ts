import { Specification } from '@severlessworkflow/sdk-typescript';
import { JSONSchema4 } from 'json-schema';
import { OpenAPIV3 } from 'openapi-types';

type OmitDistributive<T, K extends PropertyKey> = T extends any
  ? T extends object
    ? Id<OmitRecursively<T, K>>
    : T
  : never;
type Id<T> = {} & { [P in keyof T]: T[P] };
export type OmitRecursively<T extends any, K extends PropertyKey> = Omit<
  { [P in keyof T]: OmitDistributive<T[P], K> },
  K
>;

export type SwfDefinition = OmitRecursively<
  Specification.Workflow,
  'normalize'
>;

export interface SwfItem {
  uri: string;
  definition: SwfDefinition;
}

export type SwfListResult = {
  items: SwfItem[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type WorkflowFormat = 'yaml' | 'json';

export interface WorkflowSample {
  id: string;
  url: string;
}

export interface SwfSpecFile {
  path: string;
  content: OpenAPIV3.Document;
}

export type WorkflowDataInputSchema = JSONSchema4 & {
  components: {
    schemas: {
      [key: string]: OpenAPIV3.NonArraySchemaObject;
    };
  };
};

export interface WorkflowDataInputSchemaResponse {
  swfItem: SwfItem;
  schema: WorkflowDataInputSchema;
}

export interface WorkflowExecutionResponse {
  id: string;
}

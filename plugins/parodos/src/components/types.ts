// Important: KEEP FOLLOWING TYPES IN SYNC WITH BACKEND TYPES

import type { JsonObject } from '@backstage/types';
import type { UiSchema } from '@rjsf/utils';

export type ProjectStatusType = 'all-projects' | 'in-progress' | 'on-boarded';
export type AssessmentStatusType = 'none' | 'inprogress' | 'complete';

export type ProjectType = {
  id: string;
  name: string;
  username: string;
  description: string;
  createDate: string;
  modifyDate: string;

  /* TODO: https://issues.redhat.com/browse/FLPATH-131 */
  status?: ProjectStatusType;
};

export type WorkflowParameterComponentType =
  | 'PASSWORD'
  | 'TEXT'
  | 'EMAIL'
  | 'DATE'
  | 'NUMBER'
  | 'URL'
  | 'MOCK-SELECT' /* TODO: swagger is missing this type */;

export type WorkFlowTaskParameterType = {
  key: string;
  description: string;
  optional: boolean;
  type: WorkflowParameterComponentType;
  options?: {
    // for MOCK-SELECT
    // TODO: swagger is missing this type
    key: string;
    value: string;
  }[];
};

export type WorkFlowTaskDefinitionType = {
  id: string;
  name: string;
  parameters: WorkFlowTaskParameterType[];
  outputs: ('EXCEPTION' | 'HTTP2XX' | 'NO_EXCEPTION' | 'OTHER')[];
  workFlowChecker?: string;
  nextWorkFlow?: string;
};

export type WorkflowDefinitionType = {
  id: string;
  name: string;
  type: string; // TODO: should be enum
  author: string;
  createDate: string;
  modifyDate: string;
  tasks: WorkFlowTaskDefinitionType[];

  description?: string; // TODO: this is missing in swagger, so mocking it
};

export type WorkflowTaskArgumentType = {
  key: string;
  value: string;
};

export type WorkflowType = {
  projectId: string;
  workFlowName: string;
  workFlowTasks: {
    name: string;
    arguments: WorkflowTaskArgumentType[];
  }[];
};

export type WorkflowExecuteResponseType = {
  workFlowExecutionId: 'string';
  workFlowOptions: {
    /* TODO */
  };
};

export type PropsFromComponent<C> = C extends (props: infer P) => JSX.Element
  ? P
  : never;

export interface FormSchema {
  steps: {
    schema: JsonObject;
    uiSchema: UiSchema;
  }[];
}

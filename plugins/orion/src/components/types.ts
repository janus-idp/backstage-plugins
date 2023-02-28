// Important: KEEP FOLLOWING TYPES IN SYNC WITH BACKEND TYPES

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

export type ApplicationType = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
};

export type WorkFlowTaskParameterType = {
  key: string;
  description: string;
  optional: boolean;
  type:
    | 'PASSWORD'
    | 'TEXT'
    | 'EMAIL'
    | 'DATE'
    | 'NUMBER'
    | 'URL'
    | 'MOCK-SELECT' /* TODO: swagger is missing this type */;
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
  workFlowChecker: string;
  nextWorkFlow: string;
};

export type WorkflowDefinitionType = {
  id: string;
  name: string;
  type: string; // TODO: enum
  author: string;
  createDate: string;
  modifyDate: string;
  tasks: WorkFlowTaskDefinitionType[];
};

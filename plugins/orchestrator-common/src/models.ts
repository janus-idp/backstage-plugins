import { WorkflowCategory, WorkflowDefinition } from './types';

export enum ProcessInstanceState {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Aborted = 'ABORTED',
  Suspended = 'SUSPENDED',
  Error = 'ERROR',
  Pending = 'PENDING',
}

export type ProcessInstanceStateValues = Uppercase<
  keyof typeof ProcessInstanceState
>;

export enum MilestoneStatus {
  Available = 'AVAILABLE',
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
}

export interface NodeInstance {
  __typename?: 'NodeInstance';
  id: string;
  name: string;
  type: string;
  enter: string;
  exit?: string;
  definitionId: string;
  nodeId: string;
}

export interface TriggerableNode {
  id: number;
  name: string;
  type: string;
  uniqueId: string;
  nodeDefinitionId: string;
}

export interface Milestone {
  __typename?: 'Milestone';
  id: string;
  name: string;
  status: MilestoneStatus;
}

export interface ProcessInstanceError {
  __typename?: 'ProcessInstanceError';
  nodeDefinitionId: string;
  message?: string;
}

export type ProcessInstanceVariables = Record<string, unknown>;

export interface ProcessInstance {
  id: string;
  processId: string;
  processName?: string;
  parentProcessInstanceId?: string;
  rootProcessInstanceId?: string;
  rootProcessId?: string;
  roles?: string[];
  state?: ProcessInstanceStateValues;
  endpoint: string;
  serviceUrl?: string;
  nodes: NodeInstance[];
  milestones?: Milestone[];
  variables?: ProcessInstanceVariables | string;
  /** Format: date-time */
  start?: string;
  /** Format: date-time */
  end?: string;
  parentProcessInstance?: ProcessInstance;
  childProcessInstances?: ProcessInstance[];
  error?: ProcessInstanceError;
  addons?: string[];
  businessKey?: string;
  isSelected?: boolean;
  errorMessage?: string;
  isOpen?: boolean;
  diagram?: string;
  nodeDefinitions?: TriggerableNode[];
  source?: string;
  category?: WorkflowCategory;
  description?: WorkflowDefinition['description'];
}
export interface IntrospectionQuery {
  __type: IntrospectionType | null;
}

export interface IntrospectionType {
  name: string;
  kind: TypeKind;
  description: string | null;
  fields: IntrospectionField[] | null;
}

export interface IntrospectionField {
  name: string;
  type: IntrospectionTypeRef;
}

export interface IntrospectionTypeRef {
  kind: TypeKind;
  name: TypeName;
  ofType: IntrospectionTypeRef | null;
}

export enum TypeKind {
  InputObject = 'INPUT_OBJECT',
}

export enum TypeName {
  Id = 'IdArgument',
  String = 'StringArgument',
  StringArray = 'StringArrayArgument',
  Date = 'DateArgument',
}

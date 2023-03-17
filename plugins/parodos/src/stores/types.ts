import type { Project } from '../models/project';
import type { WorkflowDefinition } from '../models/workflowDefinitionSchema';

export interface UISlice {
  baseUrl: string;
  setBaseUrl(url: string): void;
}

export interface WorkflowSlice {
  workflowDefinitions: WorkflowDefinition[];
  fetch(): Promise<void>;
}

export interface ProjectsSlice {
  projects: Project[];
  fetch(): Promise<void>;
}

export type StateMiddleware = [
  ['zustand/immer', never],
  ['zustand/devtools', never],
];

export type State = UISlice & WorkflowSlice & ProjectsSlice;

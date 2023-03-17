import type { Project } from '../models/project';
import type { WorkflowDefinition } from '../models/workflowDefinitionSchema';

export interface UISlice {
  baseUrl: string | undefined;
  setBaseUrl(url: string): void;
  loading(): boolean;
  error(): unknown | undefined;
}

export interface WorkflowSlice {
  workflowDefinitions: WorkflowDefinition[];
  fetchDefinitions(): Promise<void>;
  // TODO: find a pattern that will allow loading and error on each slice
  workflowLoading: boolean;
  workflowError: unknown | undefined;
}

export interface ProjectsSlice {
  projects: Project[];
  fetchProjects(): Promise<void>;
  hasProjects(): boolean;
  addProject(project: Project): void;
  projectsLoading: boolean;
  projectsError: Error | undefined;
}

export type StateMiddleware = [
  ['zustand/immer', never],
  ['zustand/devtools', never],
];

export type State = UISlice & WorkflowSlice & ProjectsSlice;

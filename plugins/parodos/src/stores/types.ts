import type { Project } from '../models/project';
import type { WorkflowDefinition } from '../models/workflowDefinitionSchema';

export interface UISlice {
  baseUrl: string | undefined;
  setBaseUrl(url: string): void;
  loading(): boolean;
  error(): unknown | undefined;
  getApiUrl(url: string): string;
}

export const predicates = {
  byId: (workflow: WorkflowDefinition) => workflow.id,
  byType: (workflow: WorkflowDefinition) => workflow.type,
  byName: (workflow: WorkflowDefinition) => workflow.name,
} as const;

export type GetDefinitionFilter = keyof typeof predicates;

export interface WorkflowSlice {
  workflowDefinitions: WorkflowDefinition[];
  getWorkDefinitionBy(
    filterBy: GetDefinitionFilter,
    value: string,
  ): WorkflowDefinition | undefined;
  fetchDefinitions(): Promise<void>;
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

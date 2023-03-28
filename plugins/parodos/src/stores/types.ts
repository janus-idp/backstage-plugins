import { FetchApi } from '@backstage/core-plugin-api';
import type { Project } from '../models/project';
import type { WorkflowDefinition } from '../models/workflowDefinitionSchema';
import type { NotificationContent } from '../models/notification';

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
  fetchDefinitions(fetch: FetchApi['fetch']): Promise<void>;
  workflowLoading: boolean;
  workflowError: unknown | undefined;
}

export interface ProjectsSlice {
  projects: Project[];
  fetchProjects(fetch: FetchApi['fetch']): Promise<void>;
  hasProjects(): boolean;
  addProject(project: Project): void;
  projectsLoading: boolean;
  projectsError: Error | undefined;
}

export type NotificationState = 'ALL' | 'UNREAD' | 'ARCHIVED';
export type NotificationOperation = 'READ' | 'ARCHIVE';
export interface NotificationsSlice {
  notifications: NotificationContent[];
  fetchNotifications(params: {
    state: NotificationState;
    page: number;
    rowsPerPage: number;
  }): Promise<void>;
  deleteNotification(params: { id: string }): Promise<void>;
  setNotificationState(params: {
    id: string;
    newState: NotificationOperation;
  }): Promise<void>;
  notificationsLoading: boolean;
  notificationsError: Error | undefined;
}

export type StateMiddleware = [
  ['zustand/immer', never],
  ['zustand/devtools', never],
];

export type State = UISlice &
  WorkflowSlice &
  ProjectsSlice &
  NotificationsSlice;

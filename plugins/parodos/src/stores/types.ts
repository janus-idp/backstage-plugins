import { FetchApi } from '@backstage/core-plugin-api';
import type { Project } from '../models/project';
import type { WorkflowDefinition } from '../models/workflowDefinitionSchema';
import type { NotificationContent } from '../models/notification';

export type ParodosError = Error & {
  status?: number;
};
export interface UISlice {
  baseUrl: string | undefined;
  setBaseUrl(url: string): void;
  loading(): boolean;
  error(): ParodosError | undefined;
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
  workflowError?: ParodosError;
}

export interface ProjectsSlice {
  projects: Project[];
  fetchProjects(fetch: FetchApi['fetch']): Promise<void>;
  hasProjects(): boolean;
  addProject(project: Project): void;
  projectsLoading: boolean;
  projectsError?: ParodosError;
}

export type NotificationState = 'ALL' | 'UNREAD' | 'ARCHIVED';
export type NotificationOperation = 'READ' | 'ARCHIVE';
export interface NotificationsSlice {
  notifications: NotificationContent[];
  notificationsCount: number;
  fetchNotifications(params: {
    fetch: FetchApi['fetch'];
    state: NotificationState;
    page: number;
    rowsPerPage: number;
  }): Promise<void>;
  deleteNotification(params: {
    fetch: FetchApi['fetch'];
    id: string;
  }): Promise<void>;
  setNotificationState(params: {
    fetch: FetchApi['fetch'];
    id: string;
    newState: NotificationOperation;
  }): Promise<void>;
  notificationsLoading: boolean;
  notificationsError?: ParodosError;
}

export type StateMiddleware = [
  ['zustand/immer', never],
  ['zustand/devtools', never],
];

export type State = UISlice &
  WorkflowSlice &
  ProjectsSlice &
  NotificationsSlice;

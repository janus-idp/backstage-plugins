import { TaskScheduleDefinition } from '@backstage/backend-tasks';

export type AapConfig = {
  id: string;
  baseUrl: string;
  authorization: string;
  owner: string;
  system?: string;
  schedule?: TaskScheduleDefinition;
};

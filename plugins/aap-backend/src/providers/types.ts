import type { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';

export type AapConfig = {
  id: string;
  baseUrl: string;
  authorization: string;
  owner: string;
  system?: string;
  schedule?: SchedulerServiceTaskScheduleDefinition;
};

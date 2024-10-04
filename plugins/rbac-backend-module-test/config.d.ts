import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

export interface Config {
  permission?: {
    rbac?: {
      providers?: {
        test?: {
          baseUrl: string;
          accessToken: string;
          schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        };
      };
    };
  };
}

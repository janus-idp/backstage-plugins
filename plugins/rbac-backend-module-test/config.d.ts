import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

export interface Config {
  permission?: {
    rbac?: {
      providers?: {
        test?: {
          baseUrl: string;
          accessToken: string;
          schedule?: TaskScheduleDefinitionConfig;
        };
      };
    };
  };
}

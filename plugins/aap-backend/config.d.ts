import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

export interface Config {
  catalog?: {
    providers?: {
      aap?: {
        [key: string]: {
          /**
           * AapConfig
           */
          baseUrl: string;
          /** @visibility secret */
          authorization: string;
          system?: string;
          owner?: string;
          schedule?: TaskScheduleDefinitionConfig;
        };
      };
    };
  };
}

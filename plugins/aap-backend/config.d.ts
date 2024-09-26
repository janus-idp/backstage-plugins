import { SchedulerServiceTaskScheduleDefinitionConfig } from '@backstage/backend-plugin-api';

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
          schedule?: SchedulerServiceTaskScheduleDefinitionConfig;
        };
      };
    };
  };
}

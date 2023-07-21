import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

interface AapConfig {
  baseUrl: string;
  /** @visibility secret */
  authorization: string;
  system?: string;
  owner?: string;
  schedule?: TaskScheduleDefinitionConfig;
}

export interface Config {
  catalog?: {
    providers?: {
      aap?: { [key: string]: AapConfig };
    };
  };
}

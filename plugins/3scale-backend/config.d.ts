import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

interface ThreeScaleConfig {
  baseUrl: string;
  /** @visibility secret */
  accessToken: string;
  systemLabel?: string;
  ownerLabel?: string;
  addLabels?: boolean;
  schedule?: TaskScheduleDefinitionConfig;
}

export interface Config {
  catalog?: {
    providers?: {
      threeScaleApiEntity?: { [key: string]: ThreeScaleConfig };
    };
  };
}

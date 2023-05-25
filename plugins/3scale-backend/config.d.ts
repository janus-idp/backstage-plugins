import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

interface ThreeScaleConfig {
  baseUrl: string;
  serviceAccount: string;
  serviceAccountCredentials: string;
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

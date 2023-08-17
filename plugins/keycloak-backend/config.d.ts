import { TaskScheduleDefinitionConfig } from '@backstage/backend-tasks';

import { KeycloakOrgConfig } from './src/lib/types';

export interface Config {
  catalog?: {
    providers?: {
      keycloakOrg?: {
        [key: string]: (
          | Omit<KeycloakOrgConfig, 'username' | 'password'>
          | Omit<KeycloakOrgConfig, 'clientId' | 'clientSecret'>
        ) & { scheduler: TaskScheduleDefinitionConfig };
      };
    };
  };
}

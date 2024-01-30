import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createSonarQubeProjectAction } from './actions';

export const scaffolderModuleSonarqubeActions = createBackendModule({
  moduleId: 'scaffolder-backend-sonarqube',
  pluginId: 'scaffolder',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createSonarQubeProjectAction());
      },
    });
  },
});

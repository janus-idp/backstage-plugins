import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createReplaceAction } from './actions';

export const scaffolderModuleRegexActions = createBackendModule({
  moduleId: 'scaffolder-backend-regexp',
  pluginId: 'scaffolder',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createReplaceAction());
      },
    });
  },
});

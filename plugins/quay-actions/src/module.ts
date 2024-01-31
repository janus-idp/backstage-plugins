import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createQuayRepositoryAction } from './actions';

export const scaffolderModuleQuayAction = createBackendModule({
  moduleId: 'scaffolder-backend-quay',
  pluginId: 'scaffolder',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createQuayRepositoryAction());
      },
    });
  },
});

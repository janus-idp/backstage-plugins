import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createScaffoldedFromAction, createTimestampAction } from './actions';

/***/
/**
 * The annotator module for @backstage/plugin-scaffolder-backend.
 *
 * @alpha
 */
export const scaffolderCustomActionsScaffolderModule = createBackendModule({
  moduleId: 'scaffolder-backend-scaffolder-annotator',
  pluginId: 'scaffolder',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createScaffoldedFromAction());
        scaffolder.addActions(createTimestampAction());
      },
    });
  },
});

import { createBackendModule } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createScaffoldedFromSpecAction } from './actions';

/***/
/**
 * The scaffolder-relation module for @backstage/plugin-scaffolder-backend.
 *
 * @alpha
 */
export const scaffolderRelationActionScaffolderModule = createBackendModule({
  moduleId: 'scaffolder-backend-scaffolder-relation',
  pluginId: 'scaffolder',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
      },
      async init({ scaffolder }) {
        scaffolder.addActions(createScaffoldedFromSpecAction());
      },
    });
  },
});

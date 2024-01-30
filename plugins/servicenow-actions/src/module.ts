import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createServiceNowActions } from './actions';

export const scaffolderModuleServicenowActions = createBackendModule({
  moduleId: 'scaffolder-backend-servicenow',
  pluginId: 'scaffolder',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        config: coreServices.rootConfig,
      },
      async init({ scaffolder, config }) {
        scaffolder.addActions(...createServiceNowActions({ config }));
      },
    });
  },
});

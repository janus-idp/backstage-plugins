import { createBackendModule } from '@backstage/backend-plugin-api';
import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createReplaceAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: createBackendModule({
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
  }),
};

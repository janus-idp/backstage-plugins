import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createServiceNowActions } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: createBackendModule({
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
  }),
};

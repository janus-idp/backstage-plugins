import { createBackendModule } from '@backstage/backend-plugin-api';
import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: createBackendModule({
    moduleId: 'scaffolder-backend-notifications',
    pluginId: 'scaffolder',
    register(env) {
      env.registerInit({
        deps: {},
        async init() {},
      });
    },
  }),
};

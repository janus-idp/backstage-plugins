import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';

import { createRouter } from '../service/router';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  router: {
    pluginID: 'matomo',
    createPlugin: createRouter,
  },
};

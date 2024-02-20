import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';

import { createRouter } from '../service/router';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  router: {
    pluginID: 'kiali',
    createPlugin: async env => {
      return await createRouter({
        logger: env.logger,
        config: env.config,
      });
    },
  },
};

import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';
import { CatalogClient } from '@backstage/catalog-client';

import { createRouter } from '../service/router';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  router: {
    pluginID: 'kiali',
    createPlugin: async env => {
      const catalogApi = new CatalogClient({ discoveryApi: env.discovery });
      return await createRouter({
        logger: env.logger,
        catalogApi,
        config: env.config,
      });
    },
  },
};

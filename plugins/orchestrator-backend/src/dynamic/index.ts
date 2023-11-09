import { HostDiscovery } from '@backstage/backend-common';
import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';
import { CatalogClient } from '@backstage/catalog-client';

import { OrchestratorEntityProvider } from '../provider';
import { createRouter } from '../routerWrapper';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  router: {
    pluginID: 'orchestrator',
    createPlugin: async env => {
      const catalogApi = new CatalogClient({
        discoveryApi: HostDiscovery.fromConfig(env.config),
      });
      return createRouter({
        ...env,
        urlReader: env.reader,
        catalogApi,
      });
    },
  },
  async catalog(builder, env) {
    builder.addEntityProvider(
      await OrchestratorEntityProvider.fromConfig({ ...env }),
    );
  },
};

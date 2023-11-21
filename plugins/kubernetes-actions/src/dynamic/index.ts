import { BackendDynamicPluginInstaller } from '@backstage/backend-plugin-manager';
import { CatalogClient } from '@backstage/catalog-client';

import { createKubernetesNamespaceAction } from '../actions';

export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'legacy',
  scaffolder: env => {
    const catalogClient = new CatalogClient({
      discoveryApi: env.discovery,
    });

    return [createKubernetesNamespaceAction(catalogClient)];
  },
};

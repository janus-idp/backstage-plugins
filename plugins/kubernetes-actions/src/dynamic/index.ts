import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
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

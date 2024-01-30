import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { CatalogClient } from '@backstage/catalog-client';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';

import { createKubernetesNamespaceAction } from './actions';

export const scaffolderModuleKubernetesAction = createBackendModule({
  moduleId: 'scaffolder-backend-kubernetes',
  pluginId: 'scaffolder',
  register(env) {
    env.registerInit({
      deps: {
        scaffolder: scaffolderActionsExtensionPoint,
        discovery: coreServices.discovery,
      },
      async init({ scaffolder, discovery }) {
        const catalogClient = new CatalogClient({
          discoveryApi: discovery,
        });

        scaffolder.addActions(createKubernetesNamespaceAction(catalogClient));
      },
    });
  },
});

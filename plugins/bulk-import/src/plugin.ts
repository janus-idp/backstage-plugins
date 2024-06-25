import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  identityApiRef,
} from '@backstage/core-plugin-api';

import {
  bulkImportApiRef,
  BulkImportBackendClient,
} from './api/BulkImportBackendClient';
import { addRepositoriesRouteRef, rootRouteRef } from './routes';

export const bulkImportPlugin = createPlugin({
  id: 'bulk-import',
  routes: {
    root: rootRouteRef,
    addRepositories: addRepositoriesRouteRef,
  },
  apis: [
    createApiFactory({
      api: bulkImportApiRef,
      deps: {
        configApi: configApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi }) =>
        new BulkImportBackendClient({ configApi, identityApi }),
    }),
  ],
});

export const BulkImportPage = bulkImportPlugin.provide(
  createRoutableExtension({
    name: 'BulkImportPage',
    component: () => import('./components').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

export const BulkImportIcon = bulkImportPlugin.provide(
  createComponentExtension({
    name: 'BulkImportIcon',
    component: {
      lazy: () => import('./components').then(m => m.BulkImportIcon),
    },
  }),
);

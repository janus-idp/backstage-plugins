import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { addRepositoriesRouteRef, rootRouteRef } from './routes';

export const bulkImportPlugin = createPlugin({
  id: 'bulk-import',
  routes: {
    root: rootRouteRef,
    addRepositories: addRepositoriesRouteRef,
  },
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

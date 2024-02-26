import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const bulkImportPlugin = createPlugin({
  id: 'bulk-import',
  routes: {
    root: rootRouteRef,
  },
});

export const BulkImportPage = bulkImportPlugin.provide(
  createRoutableExtension({
    name: 'BulkImportPage',
    component: () => import('./components').then(m => m.BulkImportPage),
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

import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const ocmPlugin = createPlugin({
  id: 'ocm',
  routes: {
    root: rootRouteRef,
  },
});

export const OcmPage = ocmPlugin.provide(
  createRoutableExtension({
    name: 'OcmPage',
    component: () =>
      import('./components/ClusterStatusPage').then(m => m.ClusterStatusPage),
    mountPoint: rootRouteRef,
  }),
);

import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const rhacmPlugin = createPlugin({
  id: 'rhacm',
  routes: {
    root: rootRouteRef,
  },
});

export const RhacmPage = rhacmPlugin.provide(
  createRoutableExtension({
    name: 'RhacmPage',
    component: () =>
      import('./components/ClusterStatusPage').then(m => m.ClusterStatusPage),
    mountPoint: rootRouteRef,
  }),
);

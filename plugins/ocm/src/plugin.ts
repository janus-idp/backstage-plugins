import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { OcmApiClient, OcmApiRef } from './api';
import { rootRouteRef } from './routes';

export const ocmPlugin = createPlugin({
  id: 'ocm',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: OcmApiRef,
      deps: {
        configApi: configApiRef,
      },
      factory: ({ configApi }) => new OcmApiClient({ configApi }),
    }),
  ],
});

export const OcmPage = ocmPlugin.provide(
  createRoutableExtension({
    name: 'OcmPage',
    component: () =>
      import('./components/ClusterStatusPage').then(m => m.ClusterStatusPage),
    mountPoint: rootRouteRef,
  }),
);

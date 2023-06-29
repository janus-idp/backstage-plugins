import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension, identityApiRef,
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
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi }) => new OcmApiClient({ configApi, identityApi }),
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

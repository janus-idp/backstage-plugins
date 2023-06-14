import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import {
  OpenshiftImageRegistryApiClient,
  openshiftImageRegistryApiRef,
} from './api';
import { rootRouteRef } from './routes';

export const openshiftImageRegistryPlugin = createPlugin({
  id: 'openshift-image-registry',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: openshiftImageRegistryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, configApi }) =>
        new OpenshiftImageRegistryApiClient({ discoveryApi, configApi }),
    }),
  ],
});

export const OpenshiftImageRegistryPage = openshiftImageRegistryPlugin.provide(
  createRoutableExtension({
    name: 'OpenshiftImageRegistryPage',
    component: () => import('./components/OcirPage').then(m => m.OcirPage),
    mountPoint: rootRouteRef,
  }),
);

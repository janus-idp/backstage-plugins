import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { MatomoApiClient, matomoApiRef } from './api';
import { rootRouteRef } from './routes';

export const matomoPlugin = createPlugin({
  id: 'matomo',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: matomoApiRef,
      deps: {
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ configApi, fetchApi }) =>
        new MatomoApiClient({ configApi, fetchApi }),
    }),
  ],
});

export const MatomoPage = matomoPlugin.provide(
  createRoutableExtension({
    name: 'MatomoPage',
    component: () => import('./components/MatomoPage').then(m => m.MatomoPage),
    mountPoint: rootRouteRef,
  }),
);

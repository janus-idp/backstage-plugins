import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
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
      },
      factory: ({ configApi }) => new MatomoApiClient({ configApi }),
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

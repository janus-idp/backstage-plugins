import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/virtual-assistant/dist/css/main.css';

import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { lightspeedApiRef } from './api/api';
import { LightspeedApiClient } from './api/LightspeedApiClient';
import { rootRouteRef } from './routes';

export const lightspeedPlugin = createPlugin({
  id: 'lightspeed',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: lightspeedApiRef,
      deps: {
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ configApi, fetchApi }) =>
        new LightspeedApiClient({ configApi, fetchApi }),
    }),
  ],
});

export const LightspeedPage = lightspeedPlugin.provide(
  createRoutableExtension({
    name: 'LightspeedPage',
    component: () =>
      import('./components/LightspeedPage').then(m => m.LightspeedPage),
    mountPoint: rootRouteRef,
  }),
);

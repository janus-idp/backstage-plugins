import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/virtual-assistant/dist/css/main.css';

import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  identityApiRef,
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
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi }) =>
        new LightspeedApiClient({ configApi, identityApi }),
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

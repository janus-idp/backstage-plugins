import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { swfApiRef, SwfClient } from './api';
import { rootRouteRef } from './routes';

export const swfPlugin = createPlugin({
  id: 'swf',
  apis: [
    createApiFactory({
      api: swfApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory({ discoveryApi }) {
        return new SwfClient({ discoveryApi });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const SWFPage = swfPlugin.provide(
  createRoutableExtension({
    name: 'SWFPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

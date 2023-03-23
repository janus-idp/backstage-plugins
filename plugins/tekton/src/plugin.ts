import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';
import { TektonBackendClient } from './api/TektonBackendClient';
import { tektonPluginApiRef } from './api/types';

export const tektonPlugin = createPlugin({
  id: 'tekton',
  apis: [
    createApiFactory({
      api: tektonPluginApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
      },
      factory: ({ discoveryApi }) => new TektonBackendClient({ discoveryApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const TektonPage = tektonPlugin.provide(
  createRoutableExtension({
    name: 'TektonPage',
    component: () => import('./components/Tekton').then(m => m.TektonComponent),
    mountPoint: rootRouteRef,
  }),
);

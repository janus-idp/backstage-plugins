import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const tektonPlugin = createPlugin({
  id: 'tekton',
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

import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const argocdPlugin = createPlugin({
  id: 'rh-argocd',
  routes: {
    root: rootRouteRef,
  },
});

export const ArgocdPage = argocdPlugin.provide(
  createRoutableExtension({
    name: 'ArgocdPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);

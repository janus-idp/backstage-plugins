import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const orionPlugin = createPlugin({
  id: 'parodos',
  routes: {
    root: rootRouteRef,
  },
});

export const OrionPage = orionPlugin.provide(
  createRoutableExtension({
    name: 'OrionPage',
    component: () => import('./components/App').then(m => m.App),
    mountPoint: rootRouteRef,
  }),
);

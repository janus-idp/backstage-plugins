import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

export const parodosPlugin = createPlugin({
  id: 'parodos',
  routes: {
    root: rootRouteRef,
  },
});

export const ParodosPage = parodosPlugin.provide(
  createRoutableExtension({
    name: 'ParodosPage',
    component: () => import('./components/App').then(m => m.App),
    mountPoint: rootRouteRef,
  }),
);

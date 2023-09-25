import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const parodosNotificationsPlugin = createPlugin({
  id: 'parodos-notifications',
  routes: {
    root: rootRouteRef,
  },
});

export const ParodosNotificationsPage = parodosNotificationsPlugin.provide(
  createRoutableExtension({
    name: 'ParodosNotificationsPage',
    component: () =>
      import('./components/ParodosPage').then(m => m.ParodosPage),
    mountPoint: rootRouteRef,
  }),
);

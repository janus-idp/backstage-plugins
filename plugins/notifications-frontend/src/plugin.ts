import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
  // identityApiRef,
} from '@backstage/core-plugin-api';

import { NotificationsApiImpl, notificationsApiRef } from './api';
import { rootRouteRef } from './routes';

export const notificationsPlugin = createPlugin({
  id: 'notifications',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: notificationsApiRef,
      deps: { fetchApi: fetchApiRef },
      factory({ fetchApi }) {
        return new NotificationsApiImpl({
          fetchApi,
        });
      },
    }),
  ],
});

export const NotificationsPage = notificationsPlugin.provide(
  createRoutableExtension({
    name: 'NotificationsPage',
    component: () =>
      import('./components/NotificationsPage').then(m => m.NotificationsPage),
    mountPoint: rootRouteRef,
  }),
);

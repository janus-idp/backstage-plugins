import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { NotificationsApiImpl, notificationsApiRef } from './api';
import { notificationsRootRouteRef } from './routes';

export const notificationsPlugin = createPlugin({
  id: 'notifications',
  routes: {
    root: notificationsRootRouteRef,
  },
  apis: [
    createApiFactory({
      api: notificationsApiRef,
      deps: { fetchApi: fetchApiRef, configApi: configApiRef },
      factory({ fetchApi, configApi }) {
        return new NotificationsApiImpl({
          fetchApi,
          configApi,
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
    mountPoint: notificationsRootRouteRef,
  }),
);

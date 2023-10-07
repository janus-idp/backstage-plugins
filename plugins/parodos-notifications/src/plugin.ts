import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { NotificationsApiImpl, notificationsApiRef } from './api';
import { rootRouteRef } from './routes';

export const parodosNotificationsPlugin = createPlugin({
  id: 'parodos-notifications',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: notificationsApiRef,
      deps: { configApi: configApiRef, identityApi: identityApiRef },
      factory({ configApi, identityApi }) {
        return new NotificationsApiImpl({
          configApi,
          identityApi,
        });
      },
    }),
  ],
});

export const ParodosNotificationsPage = parodosNotificationsPlugin.provide(
  createRoutableExtension({
    name: 'ParodosNotificationsPage',
    component: () =>
      import('./components/ParodosPage').then(m => m.ParodosPage),
    mountPoint: rootRouteRef,
  }),
);

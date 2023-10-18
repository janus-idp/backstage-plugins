import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rbacApiRef, RBACBackendClient } from './api/RBACBackendClient';
import { rootRouteRef } from './routes';

export const rbacPlugin = createPlugin({
  id: 'rbac',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: rbacApiRef,
      deps: {
        configApi: configApiRef,
      },
      factory: ({ configApi }) => new RBACBackendClient({ configApi }),
    }),
  ],
});

export const RbacPage = rbacPlugin.provide(
  createRoutableExtension({
    name: 'RbacPage',
    component: () => import('./components/RbacPage').then(m => m.RbacPage),
    mountPoint: rootRouteRef,
  }),
);

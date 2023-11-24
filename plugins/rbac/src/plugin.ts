import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  identityApiRef,
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
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi }) =>
        new RBACBackendClient({ configApi, identityApi }),
    }),
  ],
});

export const RbacPage = rbacPlugin.provide(
  createRoutableExtension({
    name: 'RbacPage',
    component: () => import('./components').then(m => m.RbacPage),
    mountPoint: rootRouteRef,
  }),
);

export const Administration = rbacPlugin.provide(
  createComponentExtension({
    name: 'Administration',
    component: {
      lazy: () => import('./components').then(m => m.Administration),
    },
  }),
);

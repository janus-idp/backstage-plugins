import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'bulk-import',
});

export const addRepositoriesRouteRef = createSubRouteRef({
  id: 'bulk-import-repositories-add',
  parent: rootRouteRef,
  path: '/add',
});

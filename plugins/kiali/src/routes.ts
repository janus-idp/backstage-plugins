import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'kiali',
});

export const overviewRouteRef = createSubRouteRef({
  id: 'kiali-overview',
  path: '/overview',
  parent: rootRouteRef,
});

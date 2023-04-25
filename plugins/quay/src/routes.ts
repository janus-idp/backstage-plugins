import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'quay',
});

export const tagRouteRef = createSubRouteRef({
  id: 'quay-tag',
  parent: rootRouteRef,
  path: '/tag/:digest',
});

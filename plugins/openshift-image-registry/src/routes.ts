import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'openshift-image-registry',
});

export const imageTagRouteRef = createSubRouteRef({
  id: 'ocir-image-tags',
  parent: rootRouteRef,
  path: '/:ns/:image',
});

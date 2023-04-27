import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'ocr',
});

export const imageRouteRef = createSubRouteRef({
  id: 'ocr-image',
  parent: rootRouteRef,
  path: '/:cluster/:image',
});

import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'orion',
});

export const newProjectRouteRef = createSubRouteRef({
  id: 'orion-new-project',
  parent: rootRouteRef,
  path: '/newproject',
});

export const projectsRouteRef = createSubRouteRef({
  id: 'orion-projects',
  parent: rootRouteRef,
  path: '/projects',
});
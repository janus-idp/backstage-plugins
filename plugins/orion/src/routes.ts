import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'parodos',
});

export const newProjectRouteRef = createSubRouteRef({
  id: 'parodos-workflow',
  parent: rootRouteRef,
  path: '/workflow',
});

export const projectsRouteRef = createSubRouteRef({
  id: 'parodos-projects',
  parent: rootRouteRef,
  path: '/projects',
});

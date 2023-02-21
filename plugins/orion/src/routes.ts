import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'parodos',
});

export const newProjectRouteRef = createSubRouteRef({
  id: 'parodos-new-project',
  parent: rootRouteRef,
  path: '/newproject',
});

export const projectsRouteRef = createSubRouteRef({
  id: 'parodos-projects',
  parent: rootRouteRef,
  path: '/projects',
});

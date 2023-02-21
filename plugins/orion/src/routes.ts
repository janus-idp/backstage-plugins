import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'parodos',
});

export const projectOverviewRouteRef = createSubRouteRef({
  id: 'project-overview',
  parent: rootRouteRef,
  path: '/project-overview',
});

export const workflowRouteRef = createSubRouteRef({
  id: 'workflow',
  parent: rootRouteRef,
  path: '/workflow',
});


export const notificationRouteRef = createSubRouteRef({
  id: 'notification',
  parent: rootRouteRef,
  path: '/notification',
});


export const trainingRouteRef = createSubRouteRef({
  id: 'training',
  parent: rootRouteRef,
  path: '/training',
});
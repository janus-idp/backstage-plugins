import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'swf',
});

export const definitionsRouteRef = createSubRouteRef({
  id: 'swf/items',
  parent: rootRouteRef,
  path: '/items/:format/:swfId',
});

export const swfInstancesRouteRef = createSubRouteRef({
  id: 'swf/instance',
  parent: rootRouteRef,
  path: '/instances',
});

export const swfInstanceRouteRef = createSubRouteRef({
  id: 'swf/instance',
  parent: rootRouteRef,
  path: '/instances/:instanceId',
});

export const newWorkflowRef = createSubRouteRef({
  id: 'swf/workflows/new',
  parent: rootRouteRef,
  path: '/workflows/new',
});

export const createWorkflowRouteRef = createSubRouteRef({
  id: 'swf/workflows/create',
  parent: rootRouteRef,
  path: '/workflows/create/:format',
});

export const editWorkflowRouteRef = createSubRouteRef({
  id: 'swf/workflows/edit',
  parent: rootRouteRef,
  path: '/workflows/edit/:format/:swfId',
});

export const executeWorkflowRouteRef = createSubRouteRef({
  id: 'swf/workflows/execute',
  parent: rootRouteRef,
  path: '/workflows/execute/:swfId',
});

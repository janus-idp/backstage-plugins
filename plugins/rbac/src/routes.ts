import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'rbac',
});

export const roleRouteRef = createSubRouteRef({
  id: 'rbac-role-overview',
  parent: rootRouteRef,
  path: '/roles/:roleKind/:roleName',
});

export const createRoleRouteRef = createSubRouteRef({
  id: 'rbac-create-role',
  parent: rootRouteRef,
  path: '/role/new',
});

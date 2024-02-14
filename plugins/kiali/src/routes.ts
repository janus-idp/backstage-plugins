import {
  createRouteRef,
  createSubRouteRef,
  SubRouteRef,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'kiali',
});

export const overviewRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'Overview',
  path: '/overview',
  parent: rootRouteRef,
});

export const workloadsRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'Workloads',
  path: '/workloads',
  parent: rootRouteRef,
});

export const graphRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'Graph',
  path: '/graph',
  parent: rootRouteRef,
});

export const kialiRoutes: SubRouteRef<any>[] = [overviewRouteRef, graphRouteRef, workloadsRouteRef]
import {
  createRouteRef,
  createSubRouteRef,
  SubRouteRef,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'kiali',
});

export const overviewRouteRef = createSubRouteRef({
  id: 'kiali-overview',
  path: '/overview',
  parent: rootRouteRef,
});

export const workloadsRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'kiali-workloads',
  path: '/workloads',
  parent: rootRouteRef,
});

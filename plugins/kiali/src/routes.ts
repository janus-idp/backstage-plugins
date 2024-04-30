import {
  createRouteRef,
  createSubRouteRef,
  SubRouteRef,
} from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'kiali',
});

/* Kiali Page Routes */
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

export const servicesRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'kiali-services',
  path: '/services',
  parent: rootRouteRef,
});

export const appsRouteRef: SubRouteRef<undefined> = createSubRouteRef({
  id: 'kiali-apps',
  path: '/applications',
  parent: rootRouteRef,
});

export const istioConfigRouteRef = createSubRouteRef({
  id: 'kiali-istio-config',
  parent: rootRouteRef,
  path: '/istio',
});

export const workloadsDetailRouteRef = createSubRouteRef({
  id: 'kiali-workloads-details',
  parent: rootRouteRef,
  path: '/workloads/:namespace/:workload',
});

export const servicesDetailRouteRef = createSubRouteRef({
  id: 'kiali-services-details',
  parent: rootRouteRef,
  path: '/services/:namespace/:service',
});

export const appDetailRouteRef = createSubRouteRef({
  id: 'kiali-app-details',
  parent: rootRouteRef,
  path: '/applications/:namespace/:app',
});

export const istioConfigDetailRouteRef = createSubRouteRef({
  id: 'kiali-istio-config-details',
  parent: rootRouteRef,
  path: '/istio/:namespace/:objectType/:object',
});

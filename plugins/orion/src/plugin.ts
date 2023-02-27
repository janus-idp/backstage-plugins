import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import {
  // projectOverviewRouteRef,
  // workflowRouteRef,
  // deployRouteRef,
  // notificationRouteRef,
  // trainingRouteRef,
  // metricsRouteRef,
  rootRouteRef,
} from './routes';

export const orionPlugin = createPlugin({
  id: 'parodos',
  routes: {
    root: rootRouteRef,
    // projectOverview: projectOverviewRouteRef,
    // workflow: workflowRouteRef,
    // deploy: deployRouteRef,
    // notification: notificationRouteRef,
    // training: trainingRouteRef,
    // metrics: metricsRouteRef,
  },
});

export const OrionPage = orionPlugin.provide(
  createRoutableExtension({
    name: 'OrionPage',
    component: () => import('./components/App').then(m => m.App),
    mountPoint: rootRouteRef,
  }),
);

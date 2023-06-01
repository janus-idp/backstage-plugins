import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';

import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const topologyPlugin = createPlugin({
  id: 'topology',
  routes: {
    root: rootRouteRef,
  },
});

export const TopologyPage = topologyPlugin.provide(
  createRoutableExtension({
    name: 'TopologyPage',
    component: () => import('./components/Topology').then((m) => m.TopologyComponent),
    mountPoint: rootRouteRef,
  }),
);

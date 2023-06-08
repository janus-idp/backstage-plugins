import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';

import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const tektonPlugin = createPlugin({
  id: 'tekton',
  routes: {
    root: rootRouteRef,
  },
});

export const TektonPage = tektonPlugin.provide(
  createRoutableExtension({
    name: 'TektonPage',
    component: () => import('./components/Tekton').then(m => m.TektonComponent),
    mountPoint: rootRouteRef,
  }),
);

export const LatestPipelineRun = tektonPlugin.provide(
  createRoutableExtension({
    name: 'LatestPipelineRun',
    component: () =>
      import('./components/PipelineVisualizationRouter').then(
        m => m.PipelineVisualizationRouter,
      ),
    mountPoint: rootRouteRef,
  }),
);

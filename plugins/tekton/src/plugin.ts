import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';

import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { pipelineRunRouteRef, rootRouteRef } from './routes';

export const tektonPlugin = createPlugin({
  id: 'tekton',
  routes: {
    root: rootRouteRef,
    pipelineRun: pipelineRunRouteRef,
  },
});

export const TektonPage = tektonPlugin.provide(
  createRoutableExtension({
    name: 'TektonPage',
    component: () => import('./components/Tekton/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

export const LatestPipelineRun = tektonPlugin.provide(
  createComponentExtension({
    name: 'LatestPipelineRun',
    component: {
      lazy: () =>
        import('./components/PipelineVisualizationRouter').then(
          m => m.PipelineVisualizationRouter,
        ),
    },
  }),
);

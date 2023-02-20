import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

import './styles.css';

export const orionPlugin = createPlugin({
  id: 'orion',
  routes: {
    root: rootRouteRef,
  },
});

export const OrionPage = orionPlugin.provide(
  createRoutableExtension({
    name: 'OrionPage',
    component: () =>
      // import('./components/ExampleComponent').then(m => m.ExampleComponent),
      import('./components/ProjectAssessmentPage').then(
        m => m.ProjectAssessmentPage,
      ),
    mountPoint: rootRouteRef,
  }),
);

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';

import {
  createComponentExtension,
  createPlugin,
} from '@backstage/core-plugin-api';

export const tektonPlugin = createPlugin({
  id: 'tekton',
});

export const TektonCI = tektonPlugin.provide(
  createComponentExtension({
    name: 'TektonCI',
    component: {
      lazy: () => import('./components/Router').then(m => m.Router),
    },
  }),
);

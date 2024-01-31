import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { overviewRouteRef, rootRouteRef } from './routes';
import { KialiApiClient, kialiApiRef } from './services/Api';

import '@patternfly/patternfly/patternfly.css';

export const kialiPlugin = createPlugin({
  id: 'kiali',
  routes: {
    root: rootRouteRef,
    overview: overviewRouteRef,
  },
  apis: [
    createApiFactory({
      api: kialiApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi }) => new KialiApiClient(discoveryApi),
    }),
  ],
});

export const KialiPage = kialiPlugin.provide(
  createRoutableExtension({
    name: 'KialiPage',
    component: () => import('./pages/Kiali/KialiPage').then(m => m.KialiPage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Props of EntityExampleComponent
 *
 * @public
 */
export type EntityKialiContentProps = {
  /**
   * Sets the refresh interval in milliseconds. The default value is 10000 (10 seconds)
   */
  refreshIntervalMs?: number;
};

export const EntityKialiContent: (
  props: EntityKialiContentProps,
) => JSX.Element = kialiPlugin.provide(
  createRoutableExtension({
    name: 'EntityKialiContent',
    component: () => import('./Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { KialiApiClient, kialiApiRef } from './api';
import { overviewRouteRef, rootRouteRef } from './routes';

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
      },
      factory: ({ discoveryApi }) => new KialiApiClient(discoveryApi),
    }),
  ],
});

export const KialiPage = kialiPlugin.provide(
  createRoutableExtension({
    name: 'KialiPage',
    component: () =>
      import('./components/KialiComponent').then(m => m.KialiComponent),
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

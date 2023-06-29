import { Entity } from '@backstage/catalog-model';
import {
  configApiRef,
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { QuayApiClient, quayApiRef } from './api';
import { QUAY_ANNOTATION_REPOSITORY } from './hooks';
import { rootRouteRef, tagRouteRef } from './routes';

export const quayPlugin = createPlugin({
  id: 'quay',
  routes: {
    root: rootRouteRef,
    tag: tagRouteRef,
  },
  apis: [
    createApiFactory({
      api: quayApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        identityApi: identityApiRef
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        new QuayApiClient({ discoveryApi, configApi, identityApi }),
    }),
  ],
});

export const QuayPage = quayPlugin.provide(
  createRoutableExtension({
    name: 'QuayPage',
    component: () => import('./components/Router').then(m => m.Router),
    mountPoint: rootRouteRef,
  }),
);

export const isQuayAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[QUAY_ANNOTATION_REPOSITORY]);

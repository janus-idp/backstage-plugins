import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { rootRouteRef } from './routes';
import { QuayApiClient, quayApiRef } from './api';
import { QUAY_ANNOTATION_REPOSITORY } from './components/useQuayAppData';

export const quayPlugin = createPlugin({
  id: 'quay',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: quayApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, configApi }) =>
        new QuayApiClient({ discoveryApi, configApi }),
    }),
  ],
});

export const QuayPage = quayPlugin.provide(
  createComponentExtension({
    name: 'QuayPage',
    component: {
      lazy: () =>
        import('./components/QuayDashboardPage').then(m => m.QuayDashboardPage),
    },
  }),
);

export const isQuayAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[QUAY_ANNOTATION_REPOSITORY]);

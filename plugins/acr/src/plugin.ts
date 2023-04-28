import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { rootRouteRef } from './routes';
import {
  AzureContainerRegistryApiClient,
  AzureContainerRegistryApiRef,
} from './api';
import { AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME } from './consts';

export const acrPlugin = createPlugin({
  id: 'acr',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: AzureContainerRegistryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, configApi }) =>
        new AzureContainerRegistryApiClient({ discoveryApi, configApi }),
    }),
  ],
});

export const AcrPage = acrPlugin.provide(
  createComponentExtension({
    name: 'AzureContainerRegistryPage',
    component: {
      lazy: () =>
        import('./components/AcrDashboardPage').then(m => m.AcrDashboardPage),
    },
  }),
);

export const isAcrAvailable = (entity: Entity) =>
  Boolean(
    entity?.metadata.annotations?.[
      AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME
    ],
  );

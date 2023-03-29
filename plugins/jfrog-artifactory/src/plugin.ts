import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { rootRouteRef } from './routes';
import { ArtifactoryApiClient, artifactoryApiRef } from './api';
import { ARTIFACTORY_ANNOTATION_IMAGE_NAME } from './components/useArtifactoryAppData';

export const artifactoryPlugin = createPlugin({
  id: 'artifactory',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: artifactoryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, configApi }) =>
        new ArtifactoryApiClient({ discoveryApi, configApi }),
    }),
  ],
});

export const ArtifactoryPage = artifactoryPlugin.provide(
  createComponentExtension({
    name: 'ArtifactoryPage',
    component: {
      lazy: () =>
        import('./components/ArtifactoryDashboardPage').then(
          m => m.ArtifactoryDashboardPage,
        ),
    },
  }),
);

export const isArtifactoryAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[ARTIFACTORY_ANNOTATION_IMAGE_NAME]);

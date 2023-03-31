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

export const jfrogArtifactoryPlugin = createPlugin({
  id: 'jfrog-artifactory',
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

export const JfrogArtifactoryPage = jfrogArtifactoryPlugin.provide(
  createComponentExtension({
    name: 'JfrogArtifactoryPage',
    component: {
      lazy: () =>
        import('./components/ArtifactoryDashboardPage').then(
          m => m.ArtifactoryDashboardPage,
        ),
    },
  }),
);

export const isJfrogArtifactoryAvailable = (entity: Entity) =>
  Boolean(entity?.metadata.annotations?.[ARTIFACTORY_ANNOTATION_IMAGE_NAME]);

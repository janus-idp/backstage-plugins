import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  configApiRef,
} from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { rootRouteRef } from './routes';
import { JfrogArtifactoryApiClient, jfrogArtifactoryApiRef } from './api';
import { JFROG_ARTIFACTORY_ANNOTATION_IMAGE_NAME } from './components/useJfrogArtifactoryAppData';

export const jfrogArtifactoryPlugin = createPlugin({
  id: 'jfrog-artifactory',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: jfrogArtifactoryApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, configApi }) =>
        new JfrogArtifactoryApiClient({ discoveryApi, configApi }),
    }),
  ],
});

export const JfrogArtifactoryPage = jfrogArtifactoryPlugin.provide(
  createComponentExtension({
    name: 'JfrogArtifactoryPage',
    component: {
      lazy: () =>
        import('./components/JfrogArtifactoryDashboardPage').then(
          m => m.JfrogArtifactoryDashboardPage,
        ),
    },
  }),
);

export const isJfrogArtifactoryAvailable = (entity: Entity) =>
  Boolean(
    entity?.metadata.annotations?.[JFROG_ARTIFACTORY_ANNOTATION_IMAGE_NAME],
  );

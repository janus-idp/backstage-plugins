import { Entity } from '@backstage/catalog-model';
import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { JfrogArtifactoryApiClient, jfrogArtifactoryApiRef } from './api';
import { JFROG_ARTIFACTORY_ANNOTATION_IMAGE_NAME } from './components/useJfrogArtifactoryAppData';
import { rootRouteRef } from './routes';

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
        identityApi: identityApiRef
      },
      factory: ({ discoveryApi, configApi, identityApi }) =>
        new JfrogArtifactoryApiClient({ discoveryApi, configApi, identityApi }),
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

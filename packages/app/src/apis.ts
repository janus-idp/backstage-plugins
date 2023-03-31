import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import {
  AnyApiFactory,
  configApiRef,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';
import { createFetchApi, FetchMiddlewares } from '@backstage/core-app-api';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  createApiFactory({
    api: fetchApiRef,
    deps: {
      configApi: configApiRef,
      identityApi: identityApiRef,
      discoveryApi: discoveryApiRef,
    },
    factory: ({ configApi, identityApi, discoveryApi }) => {
      return createFetchApi({
        middleware: [
          FetchMiddlewares.resolvePluginProtocol({
            discoveryApi,
          }),
          FetchMiddlewares.injectIdentityAuth({
            identityApi,
            config: configApi,
            header: {
              name: 'Authorization',
              value: token => `Basic ${token}`,
            },
          }),
        ],
      });
    },
  }),
];

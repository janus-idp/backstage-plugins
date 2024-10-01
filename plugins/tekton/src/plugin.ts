import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
  gitlabAuthApiRef,
  googleAuthApiRef,
  microsoftAuthApiRef,
  oktaAuthApiRef,
  oneloginAuthApiRef,
} from '@backstage/core-plugin-api';
import {
  KubernetesAuthProviders,
  KubernetesBackendClient,
  KubernetesProxyClient,
} from '@backstage/plugin-kubernetes-react';

import {
  kubernetesApiRef,
  kubernetesAuthProvidersApiRef,
  kubernetesProxyApiRef,
} from './types/types';

export const tektonPlugin = createPlugin({
  id: 'tekton',
  apis: [
    createApiFactory({
      api: kubernetesAuthProvidersApiRef,
      deps: {
        gitlabAuthApi: gitlabAuthApiRef,
        googleAuthApi: googleAuthApiRef,
        microsoftAuthApi: microsoftAuthApiRef,
        oktaAuthApi: oktaAuthApiRef,
        oneloginAuthApi: oneloginAuthApiRef,
      },
      factory: ({
        gitlabAuthApi,
        googleAuthApi,
        microsoftAuthApi,
        oktaAuthApi,
        oneloginAuthApi,
      }) => {
        const oidcProviders = {
          gitlab: gitlabAuthApi,
          google: googleAuthApi,
          microsoft: microsoftAuthApi,
          okta: oktaAuthApi,
          onelogin: oneloginAuthApi,
        };

        return new KubernetesAuthProviders({
          microsoftAuthApi,
          googleAuthApi,
          oidcProviders,
        });
      },
    }),
    createApiFactory({
      api: kubernetesApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        kubernetesAuthProvidersApi: kubernetesAuthProvidersApiRef,
      },
      factory: ({ discoveryApi, fetchApi, kubernetesAuthProvidersApi }) =>
        new KubernetesBackendClient({
          discoveryApi,
          fetchApi,
          kubernetesAuthProvidersApi,
        }),
    }),
    createApiFactory({
      api: kubernetesProxyApiRef,
      deps: {
        kubernetesApi: kubernetesApiRef,
      },
      factory: ({ kubernetesApi }) =>
        new KubernetesProxyClient({
          kubernetesApi,
        }),
    }),
  ],
});

export const TektonCI = tektonPlugin.provide(
  createComponentExtension({
    name: 'TektonCI',
    component: {
      lazy: () => import('./components/Router').then(m => m.Router),
    },
  }),
);

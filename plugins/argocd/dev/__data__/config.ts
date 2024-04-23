import { Config } from '@kubernetes/client-node';

export const mockArgocdConfig: Config = {
  argocd: {
    baseUrl: 'https://localhost:8080',
    username: 'argocd-test-account',
    password: 'argocd-test-pass',
    appLocatorMethods: [
      {
        type: 'config',
        instances: [
          {
            name: 'argoInstance1',
            url: 'https://test-openshift-gitops.apps.test.devcluster.openshift.com/',
            token: 'fake-jwt-token1',
          },
          {
            name: 'argoInstance2',
            url: 'https://test-openshift-gitops.apps.test.devcluster.openshift.com/',
            token: 'fake-jwt-token2',
          },
        ],
      },
    ],
  },
};

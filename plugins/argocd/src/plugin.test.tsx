import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { configApiRef } from '@backstage/core-plugin-api';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  MockConfigApi,
  renderInTestApp,
  TestApiProvider,
} from '@backstage/test-utils';

import { screen, waitFor } from '@testing-library/react';

import { mockApplication, mockEntity, mockRevision } from '../dev/__data__';
import { argoCDApiRef } from './api';
import {
  ArgocdDeploymentLifecycle,
  ArgocdDeploymentSummary,
  argocdPlugin,
} from './plugin';
import { rootRouteRef } from './routes';

describe('argocd', () => {
  const mockedApi: any = {
    listApps: async () => {
      return { items: [mockApplication] };
    },
    getRevisionDetails: async () => {
      return mockRevision;
    },
    getRevisionDetailsList: async () => {
      return [mockRevision];
    },
  };

  const mockConfiguration = new MockConfigApi({
    backend: {
      baseUrl: 'http://localhost:7007',
      listen: {
        port: 7007,
      },
    },
    argocd: {
      appLocatorMethods: [],
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <TestApiProvider
        apis={[
          [argoCDApiRef, mockedApi],
          [configApiRef, mockConfiguration],
        ]}
      >
        <EntityProvider entity={mockEntity}>{children}</EntityProvider>
      </TestApiProvider>
    );
  };

  it('should export plugin', () => {
    // const app = createDevApp().registerPlugin(argocdPlugin).build();

    const [argoApi] = argocdPlugin.getApis();
    expect(argocdPlugin).toBeDefined();

    expect(
      argoApi.factory({
        identityApi: { getCredentials: () => {} },
        configApi: mockConfiguration,
      }),
    ).toBeDefined();
  });

  it('should render the deployment lifecycle extension', async () => {
    await renderInTestApp(
      <Wrapper>
        <Routes>
          <Route path="/" element={<ArgocdDeploymentLifecycle />} />
        </Routes>
      </Wrapper>,
      {
        mountedRoutes: {
          '/': rootRouteRef,
        },
      },
    );

    await waitFor(() => {
      expect(screen.queryByText('Deployment lifecycle')).toBeInTheDocument();
    });
  });

  it('should render the deployment summary extension', async () => {
    await renderInTestApp(
      <Wrapper>
        <Routes>
          <Route path="/" element={<ArgocdDeploymentSummary />} />
        </Routes>
      </Wrapper>,
      {
        mountedRoutes: {
          '/': rootRouteRef,
        },
      },
    );

    await waitFor(() => {
      expect(screen.queryByText('Deployment summary')).toBeInTheDocument();
    });
  });
});

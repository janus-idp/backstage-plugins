import React, { PropsWithChildren } from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { createTheme, ThemeProvider } from '@material-ui/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import { useArgocdConfig } from '../../../hooks/useArgocdConfig';
import DeploymentLifecycle from '../DeploymentLifecycle';

jest.mock('../../../hooks/useArgocdConfig', () => ({
  useArgocdConfig: jest.fn(),
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => mockEntity,
}));

jest.mock('@backstage/core-components', () => ({
  ...jest.requireActual('@backstage/core-components'),
  ResponseErrorPanel: ({ error }: { error: Error }) => (
    <div data-testid="error-panel">{JSON.stringify(error)}</div>
  ),
}));

describe('DeploymentLifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useArgocdConfig as any).mockReturnValue({
      baseUrl: 'https://baseurl.com',
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });

    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({ items: [mockApplication] });
      },
      getRevisionDetailsList: async () => {
        return Promise.resolve({
          commit: 'commit message',
          author: 'test-user',
          date: new Date(),
        });
      },
    });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  test('should render the loader component', async () => {
    render(<DeploymentLifecycle />);

    await waitFor(() => {
      screen.getByTestId('argocd-loader');
    });
  });

  test('should render deployment lifecycle component', async () => {
    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();

      screen.getByText('Deployment lifecycle');
      screen.getByTestId('quarkus-app-dev-card');
    });
  });

  const theme = createTheme({
    palette: {
      type: 'dark',
    },
  });

  const Providers = ({ children }: PropsWithChildren) => (
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  );

  test('should render components in dark theme', async () => {
    render(
      <Providers>
        <DeploymentLifecycle />
      </Providers>,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();

      screen.getByText('Deployment lifecycle');
      screen.getByTestId('quarkus-app-dev-card');
    });
  });

  test('should catch the error while fetching revision details', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({ items: [mockApplication] });
      },
      getRevisionDetailsList: async () => {
        return Promise.reject(new Error('500: Internal server error'));
      },
    });

    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();

      screen.getByText('Deployment lifecycle');
      screen.getByTestId('quarkus-app-dev-card');
    });
  });

  test('should catch the error while fetching applications', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.reject(new Error('500: Internal server error'));
      },
      getRevisionDetailsList: async () => {
        return Promise.resolve({
          commit: 'commit message',
          author: 'test-user',
          date: new Date(),
        });
      },
    });
    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();
      screen.getByTestId('error-panel');
    });
  });

  test('should open and close the sidebar', async () => {
    render(<DeploymentLifecycle />);

    await waitFor(() => {
      expect(screen.queryByTestId('argocd-loader')).not.toBeInTheDocument();
      screen.getByText('Deployment lifecycle');

      screen.getByTestId('quarkus-app-dev-card');
    });

    fireEvent.click(screen.getByTestId('quarkus-app-dev-card'));

    await waitFor(() => {
      screen.getByTestId('quarkus-app-dev-drawer');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close the drawer' }));

    await waitFor(() => {
      expect(
        screen.queryByTestId('quarkus-app-dev-drawer'),
      ).not.toBeInTheDocument();
    });
  });
});

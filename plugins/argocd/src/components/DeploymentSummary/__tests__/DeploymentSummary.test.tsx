import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import { useArgocdConfig } from '../../../hooks/useArgocdConfig';
import { Application, History } from '../../../types';
import DeploymentSummary from '../DeploymentSummary';

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

describe('DeploymentSummary', () => {
  beforeEach(() => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({ items: [mockApplication] });
      },
    });

    (useArgocdConfig as any).mockReturnValue({
      baseUrl: '',
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });
  });

  test('should render loading indicator', async () => {
    render(<DeploymentSummary />);

    await waitFor(() => {
      screen.getByRole('progressbar');
    });
  });

  test('should render empty table incase of no applications', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({ items: [] });
      },
    });

    (useArgocdConfig as any).mockReturnValue({
      baseUrl: 'https://baseurl.com',
      instances: [{ name: 'test', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      screen.getByText('No records to display');
    });
  });

  test('should not render deployment summary table incase of error', async () => {
    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.reject(new Error('500: Internal server error'));
      },
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryByText('Deployment summary')).not.toBeInTheDocument();
    });
  });

  test('should render deployment summary', async () => {
    (useArgocdConfig as any).mockReturnValue({
      instances: [{ name: 'test', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'test',
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      screen.getAllByText('quarkus-app-dev');
      screen.getByText('Healthy');
      screen.getByText('Synced');
    });
  });

  test('should link the application to instance url', async () => {
    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      expect(
        screen.getByRole('link', { name: 'quarkus-app-dev' }),
      ).toHaveAttribute(
        'href',
        'https://main-instance-url.com/applications/quarkus-app-dev',
      );
    });
  });

  test('should link the application to the base argocd url', async () => {
    (useArgocdConfig as any).mockReturnValue({
      baseUrl: 'https://baseurl.com',
      instances: [],
      intervalMs: 10000,
      instanceName: 'main',
    });

    render(<DeploymentSummary />);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      screen.getAllByText('quarkus-app-dev');
      screen.getByText('Healthy');
      screen.getByText('Synced');

      expect(
        screen.getByRole('link', { name: 'quarkus-app-dev' }),
      ).toHaveAttribute(
        'href',
        'https://baseurl.com/applications/quarkus-app-dev',
      );
    });
  });

  test('should sort by last deployment time', async () => {
    const mockApplicationTwo: Application = {
      ...mockApplication,
      status: {
        ...mockApplication.status,
        history: [
          {
            ...(mockApplication?.status?.history?.[0] as History),
            revision: '12345',
          },
          {
            ...(mockApplication?.status?.history?.[1] as History),
            revision: 'abcde',
            deployedAt: new Date().toISOString(),
          },
        ],
      },
    };

    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({
          items: [mockApplication, mockApplicationTwo],
        });
      },
    });

    render(<DeploymentSummary />);
    const lastDeployedHeader = screen.getByRole('button', {
      name: 'Last deployed',
    });

    await waitFor(() => {
      const tableBody = screen.getAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).getAllByRole('row')[0];

      within(firstRow).getByText('90f9758');
    });
    await fireEvent.click(lastDeployedHeader);
    // miui table requires two clicks to start sorting
    await fireEvent.click(lastDeployedHeader);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      const tableBody = screen.getAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).getAllByRole('row')[0];

      within(firstRow).getByText('abcde');
    });
  });

  test('should sort by last deployment time even if the history is missing for some applications', async () => {
    const mockApplicationTwo: Application = {
      ...mockApplication,
      status: {
        ...mockApplication.status,
        history: undefined,
      },
    };

    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({
          items: [mockApplication, mockApplicationTwo],
        });
      },
    });

    render(<DeploymentSummary />);
    const lastDeployedHeader = screen.getByRole('button', {
      name: 'Last deployed',
    });

    await waitFor(() => {
      const tableBody = screen.getAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).getAllByRole('row')[0];

      within(firstRow).getByText('90f9758');
    });
    await fireEvent.click(lastDeployedHeader);
    // miui table requires two clicks to start sorting
    await fireEvent.click(lastDeployedHeader);

    await waitFor(() => {
      const tableBody = screen.getAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).getAllByRole('row')[0];

      within(firstRow).getByText('-');
    });
  });

  test('should sort by application sync status', async () => {
    const mockApplicationTwo: Application = {
      ...mockApplication,
      status: {
        ...mockApplication.status,
        sync: {
          status: 'OutOfSync',
        },
      },
    };

    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({
          items: [mockApplication, mockApplicationTwo],
        });
      },
    });

    render(<DeploymentSummary />);
    const syncStatusHeader = screen.getByRole('button', {
      name: 'Sync status',
    });

    await waitFor(() => {
      const tableBody = screen.getAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).getAllByRole('row')[0];

      within(firstRow).getByText('Synced');
    });
    await fireEvent.click(syncStatusHeader);
    // miui table requires two clicks to start sorting
    await fireEvent.click(syncStatusHeader);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      const tableBody = screen.getAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).getAllByRole('row')[0];

      within(firstRow).getByText('OutOfSync');
    });
  });

  test('should sort by application health status', async () => {
    const mockApplicationTwo: Application = {
      ...mockApplication,
      status: {
        ...mockApplication.status,
        health: {
          status: 'Degraded',
        },
      },
    };

    (useApi as any).mockReturnValue({
      listApps: async () => {
        return Promise.resolve({
          items: [mockApplication, mockApplicationTwo],
        });
      },
    });

    render(<DeploymentSummary />);
    const healthStatusHeader = screen.getByRole('button', {
      name: 'Health status',
    });

    await waitFor(() => {
      const tableBody = screen.getAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).getAllByRole('row')[0];

      within(firstRow).getByText('Healthy');
    });
    await fireEvent.click(healthStatusHeader);
    // miui table requires two clicks to start sorting
    await fireEvent.click(healthStatusHeader);

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();

      const tableBody = screen.getAllByRole('rowgroup')[1];
      const firstRow = within(tableBody).getAllByRole('row')[0];

      within(firstRow).getByText('Degraded');
    });
  });
});

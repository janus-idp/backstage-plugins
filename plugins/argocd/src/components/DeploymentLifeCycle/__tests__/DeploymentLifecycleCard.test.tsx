import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import { useArgocdConfig } from '../../../hooks/useArgocdConfig';
import { Application, Source } from '../../../types';
import DeploymentLifecycleCard from '../DeploymentLifecycleCard';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    ...mockEntity,
    metadata: {
      ...mockEntity.metadata,
      annotations: {
        ...mockEntity.metadata.annotations,
        'gitlab.com/source-url': 'https://gitlab.com/testingrepo',
      },
    },
  }),
}));

jest.mock('../../../hooks/useArgocdConfig', () => ({
  useArgocdConfig: jest.fn(),
}));

describe('DeploymentLifecylceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useArgocdConfig as any).mockReturnValue({
      baseUrl: '',
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });
  });

  test('should not render if the application is not passed', () => {
    render(
      <DeploymentLifecycleCard
        app={null as unknown as Application}
        revisionsMap={{}}
      />,
    );

    expect(
      screen.queryByTestId('quarkus-app-dev-card'),
    ).not.toBeInTheDocument();
  });
  test('should render if the application card', () => {
    render(<DeploymentLifecycleCard app={mockApplication} revisionsMap={{}} />);
    screen.getByTestId('quarkus-app-dev-card');
  });

  test('application header should link to external link', () => {
    render(<DeploymentLifecycleCard app={mockApplication} revisionsMap={{}} />);
    const link = screen.getByTestId('quarkus-app-dev-link');
    fireEvent.click(link);

    expect(link).toHaveAttribute(
      'href',
      'https://main-instance-url.com/applications/quarkus-app-dev',
    );
  });

  test('should render incluster tooltip', () => {
    render(<DeploymentLifecycleCard app={mockApplication} revisionsMap={{}} />);

    fireEvent.mouseDown(screen.getByText('(in-cluster)'));

    screen.getByTestId('local-cluster-tooltip');
  });

  test('should render remote cluster url', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        destination: {
          server: 'http://remote-url.com',
          namespace: 'remote-ns',
        },
      },
    };
    render(
      <DeploymentLifecycleCard app={remoteApplication} revisionsMap={{}} />,
    );

    expect(screen.queryByText('(in-cluster)')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('local-cluster-tooltip'),
    ).not.toBeInTheDocument();

    screen.getByText('http://remote-url.com');
  });

  test('should not open a new windown if the missing git url', () => {
    const remoteApplication: Application = {
      ...mockApplication,
      spec: {
        ...mockApplication.spec,
        source: undefined as unknown as Source,
      },
    };
    global.open = jest.fn();

    render(
      <DeploymentLifecycleCard app={remoteApplication} revisionsMap={{}} />,
    );
    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).toHaveBeenCalledTimes(0);
  });

  test('application card should contain commit link', () => {
    (useArgocdConfig as any).mockReturnValue({
      baseUrl: 'https://baseUrl.com',
      instances: [{ name: 'main', url: 'https://main-instance-url.com' }],
      intervalMs: 10000,
      instanceName: 'main',
    });

    global.open = jest.fn();

    render(
      <DeploymentLifecycleCard
        app={mockApplication}
        revisionsMap={{
          '90f9758b7033a4bbb7c33a35ee474d61091644bc': {
            author: 'test user',
            message: 'commit message',
            date: new Date(),
          },
        }}
      />,
    );

    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).toHaveBeenCalled();
    expect(global.open).toHaveBeenCalledWith(
      'https://gitlab-gitlab.apps.cluster.test.com/development/quarkus-app-gitops',
      '_blank',
    );
    screen.getByText('commit message');
  });
});

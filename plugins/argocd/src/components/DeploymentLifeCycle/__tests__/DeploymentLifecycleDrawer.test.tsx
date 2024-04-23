import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { mockApplication, mockEntity } from '../../../../dev/__data__';
import { Application, Source } from '../../../types';
import DeploymentLifecycleDrawer from '../DeploymentLifecycleDrawer';

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
describe('DeploymentLifecycleDrawer', () => {
  test('should not render the application drawer component', () => {
    render(
      <DeploymentLifecycleDrawer
        app={null as unknown as Application}
        isOpen={true}
        onClose={() => jest.fn()}
        revisionsMap={{}}
      />,
    );

    expect(
      screen.queryByTestId('quarkus-app-dev-drawer'),
    ).not.toBeInTheDocument();
  });

  test('should render the application drawer component', () => {
    render(
      <DeploymentLifecycleDrawer
        app={mockApplication}
        isOpen={true}
        onClose={() => jest.fn()}
        revisionsMap={{}}
      />,
    );

    screen.getByTestId('quarkus-app-dev-drawer');
  });

  test('should render the commit link in drawer component', () => {
    global.open = jest.fn();

    render(
      <DeploymentLifecycleDrawer
        app={mockApplication}
        isOpen={true}
        onClose={() => jest.fn()}
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
      <DeploymentLifecycleDrawer
        isOpen
        onClose={jest.fn()}
        app={remoteApplication}
        revisionsMap={{}}
      />,
    );
    const commitLink = screen.getByTestId('90f97-commit-link');
    fireEvent.click(commitLink);

    expect(global.open).toHaveBeenCalledTimes(0);
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
      <DeploymentLifecycleDrawer
        isOpen
        onClose={jest.fn()}
        app={remoteApplication}
        revisionsMap={{}}
      />,
    );

    expect(screen.queryByText('(in-cluster)')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('local-cluster-tooltip'),
    ).not.toBeInTheDocument();

    screen.getByText('http://remote-url.com');
  });
});

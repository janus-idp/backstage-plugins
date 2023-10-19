import React from 'react';

import { render } from '@testing-library/react';

import { usePodLogs } from '../../../../hooks/usePodLogs';
import { PodLogs } from './PodLogs';

jest.mock('../../../../hooks/usePodLogs', () => ({
  usePodLogs: jest.fn(),
}));

jest.mock('@backstage/core-components', () => ({
  LogViewer: () => <div data-testid="log-viewer">Log viewer</div>,
  DismissableBanner: () => (
    <div data-testid="pod-log-banner">Dismissable banner</div>
  ),
}));

describe('PodLogs', () => {
  it('should render logviewer', () => {
    const podScopeData = {
      podName: 'node-ex-git-er56',
      podNamespace: 'sample-app',
      containerName: 'node-ex-git',
      clusterName: 'OCP',
    };
    (usePodLogs as jest.Mock).mockReturnValue({
      loading: false,
      value: 'log data...',
    });
    const { queryByTestId } = render(
      <PodLogs podScope={podScopeData} setLogText={() => {}} />,
    );
    expect(queryByTestId('pod-log-banner')).not.toBeInTheDocument();
    expect(queryByTestId('log-viewer')).toBeInTheDocument();
  });

  it('should render logviewer skeleton', () => {
    const podScopeData = {
      podName: 'node-ex-git-er56',
      podNamespace: 'sample-app',
      containerName: 'node-ex-git',
      clusterName: 'OCP',
    };
    (usePodLogs as jest.Mock).mockReturnValue({ loading: true });
    const { queryByTestId } = render(
      <PodLogs podScope={podScopeData} setLogText={() => {}} />,
    );
    expect(queryByTestId('pod-log-banner')).not.toBeInTheDocument();
    expect(queryByTestId('log-viewer')).not.toBeInTheDocument();
    expect(queryByTestId('logs-skeleton')).toBeInTheDocument();
  });

  it('should render DismissableBanner in case of error', () => {
    const podScopeData = {
      podName: 'node-ex-git-er56',
      podNamespace: 'sample-app',
      containerName: 'node-ex-git',
      clusterName: 'OCP',
    };
    (usePodLogs as jest.Mock).mockReturnValue({
      loading: false,
      error: { message: 'some crash!!' },
    });
    const { queryByTestId } = render(
      <PodLogs podScope={podScopeData} setLogText={() => {}} />,
    );
    expect(queryByTestId('pod-log-banner')).toBeInTheDocument();
    expect(queryByTestId('log-viewer')).not.toBeInTheDocument();
    expect(queryByTestId('logs-skeleton')).not.toBeInTheDocument();
  });
});

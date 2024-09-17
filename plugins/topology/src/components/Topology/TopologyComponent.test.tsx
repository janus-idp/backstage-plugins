import React from 'react';

import { useTheme } from '@material-ui/core';
import { render } from '@testing-library/react';

import { TopologyComponent } from './TopologyComponent';

jest.mock('@material-ui/core', () => ({
  ...jest.requireActual('@material-ui/core'),
  makeStyles: jest.fn().mockReturnValue(() => ({})),
}));

jest.mock('../../hooks/useK8sObjectsResponse', () => ({
  useK8sObjectsResponse: () => ({
    watchResourcesData: {
      deployments: {
        data: [],
      },
      pods: {
        data: [],
      },
    },
    loading: false,
    responseError: '',
    selectedClusterErrors: [],
    clusters: [],
    setSelectedCluster: () => {},
  }),
}));

jest.mock('@material-ui/core/styles', () => ({
  useTheme: jest.fn(),
}));

jest.mock('./TopologyWorkloadView', () => ({
  TopologyWorkloadView: () => <div>TopologyWorkloadView</div>,
}));

const useThemeMock = useTheme as jest.Mock;

describe('TopologyComponent', () => {
  it('should render TopologyComponent', () => {
    useThemeMock.mockReturnValue({
      palette: {
        type: 'dark',
      },
    });
    const { getByText } = render(<TopologyComponent />);
    expect(getByText(/topologyworkloadview/i)).not.toBeNull();
  });

  it('should show dark theme', () => {
    useThemeMock.mockReturnValue({
      palette: {
        type: 'dark',
      },
    });
    render(<TopologyComponent />);
    const htmlTagElement = document.documentElement;
    expect(htmlTagElement.classList.contains('pf-v5-theme-dark')).toBe(true);
  });

  it('should show light theme', () => {
    useThemeMock.mockReturnValue({
      palette: {
        type: 'light',
      },
    });
    render(<TopologyComponent />);
    const htmlTagElement = document.documentElement;
    expect(htmlTagElement.classList.contains('pf-v5-theme-dark')).toBe(false);
  });
});

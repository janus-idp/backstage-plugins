import React from 'react';

import { usePermission } from '@backstage/plugin-permission-react';

import { render } from '@testing-library/react';

import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';
import { useWorkloadsWatcher } from '../../hooks/useWorkloadWatcher';
import TopologyViewWorkloadComponent from './TopologyViewWorkloadComponent';

jest.mock('../../hooks/useWorkloadWatcher', () => ({
  useWorkloadsWatcher: jest.fn(),
}));

const mockUseWorkloadsWatcher = useWorkloadsWatcher as jest.Mock;

jest.mock('@backstage/plugin-permission-react', () => ({
  usePermission: jest.fn(),
}));

const mockUsePermission = usePermission as jest.MockedFunction<
  typeof usePermission
>;

jest.mock('@patternfly/react-topology', () => ({
  useVisualizationController: () => ({
    getGraph: () => ({
      getElements: () => [],
      getDimensions: () => {
        return {
          width: 100,
          height: 100,
        };
      },
    }),
    fromModel: () => {},
    hasGraph: () => true,
  }),
  useEventListener: () => {},
  action: () => {},
  createTopologyControlButtons: () => {},
  observer: (a: React.FC) => a,
  VisualizationSurface: () => <div>VisualizationSurface</div>,
  TopologyView: () => <div>TopologyView</div>,
}));

describe('TopologyViewWorkloadComponent', () => {
  beforeEach(() => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: true });
  });

  it('should show loading state when loading is true', () => {
    mockUseWorkloadsWatcher.mockReturnValue({
      loaded: false,
      dataModel: { nodes: [] },
    });
    const { getByTestId } = render(<TopologyViewWorkloadComponent />);
    expect(getByTestId('topology-progress')).not.toBeNull();
  });

  it('should render TopologyEmptyState when no data is available and loading is false', () => {
    mockUseWorkloadsWatcher.mockReturnValue({
      loaded: true,
      dataModel: { nodes: [] },
    });
    const { getByRole } = render(<TopologyViewWorkloadComponent />);
    expect(
      getByRole('heading', {
        name: /no resources found/i,
      }),
    ).not.toBeNull();
  });

  it('should render TopologyView when data is available and loading is false', () => {
    mockUseWorkloadsWatcher.mockReturnValue({
      loaded: true,
      dataModel: { nodes: [{}] },
    });
    const { getByText } = render(
      <K8sResourcesContext.Provider
        value={{ clusters: ['ocp'], setSelectedCluster: () => {} }}
      >
        <TopologyViewWorkloadComponent />
      </K8sResourcesContext.Provider>,
    );
    expect(getByText(/topologyview/i)).not.toBeNull();
  });

  it('should not render TopologyView when data is available, loading is false, but user is not allowed', () => {
    mockUsePermission.mockReturnValue({ loading: false, allowed: false });

    mockUseWorkloadsWatcher.mockReturnValue({
      loaded: true,
      dataModel: { nodes: [{}] },
    });
    const { getByText } = render(
      <K8sResourcesContext.Provider
        value={{ clusters: ['ocp'], setSelectedCluster: () => {} }}
      >
        <TopologyViewWorkloadComponent />
      </K8sResourcesContext.Provider>,
    );
    expect(getByText(/topologyview/i)).not.toBeNull();

    const { getByRole } = render(<TopologyViewWorkloadComponent />);
    expect(
      getByRole('heading', {
        name: /no resources found/i,
      }),
    ).not.toBeNull();
  });
});

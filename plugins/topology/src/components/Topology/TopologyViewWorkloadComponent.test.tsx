import * as React from 'react';
import { Progress } from '@backstage/core-components';
import { TopologyView } from '@patternfly/react-topology';
import { render } from '@testing-library/react';
import { useWorkloadsWatcher } from '../../hooks/useWorkloadWatcher';
import { TopologyEmptyState } from './TopologyEmptyState';
import TopologyViewWorkloadComponent from './TopologyViewWorkloadComponent';

jest.mock('../../hooks/useWorkloadWatcher', () => ({
  useWorkloadsWatcher: jest.fn(),
}));

const mockUseWorkloadsWatcher = useWorkloadsWatcher as jest.Mock;

jest.mock('@patternfly/react-topology', () => ({
  useVisualizationController: () => ({
    getVisualization: () => ({
      getGraph: () => ({
        getElements: () => [],
      }),
    }),
    fromModel: () => {},
  }),
  useEventListener: () => {},
  action: () => {},
  createTopologyControlButtons: () => {},
  VisualizationSurface: () => <div>VisualizationSurface</div>,
  TopologyView: () => <div>TopologyView</div>,
  TopologyControlBar: () => <div>TopologyControlBar</div>,
}));

describe('TopologyViewWorkloadComponent', () => {
  it('should show loading state when loading is true', () => {
    mockUseWorkloadsWatcher.mockReturnValue({
      loaded: false,
      dataModel: { nodes: [] },
    });
    render(<TopologyViewWorkloadComponent />);
    expect(Progress).toBeDefined();
  });

  it('should render TopologyEmptyState when no data is available and loading is false', () => {
    mockUseWorkloadsWatcher.mockReturnValue({
      loaded: true,
      dataModel: { nodes: [] },
    });
    const { getByText } = render(<TopologyViewWorkloadComponent />);
    expect(TopologyEmptyState).toBeTruthy();
    expect(getByText('No resources found')).toBeInTheDocument();
  });

  it('should render TopologyView when data is available and loading is false', () => {
    mockUseWorkloadsWatcher.mockReturnValue({
      loaded: true,
      dataModel: { nodes: [{}] },
    });
    render(<TopologyViewWorkloadComponent />);
    expect(TopologyView).toBeDefined();
  });
});

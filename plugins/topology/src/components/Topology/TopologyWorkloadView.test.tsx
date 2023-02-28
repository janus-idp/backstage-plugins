import * as React from 'react';
import { VisualizationProvider } from '@patternfly/react-topology';
import { render } from '@testing-library/react';
import { TopologyWorkloadView } from './TopologyWorkloadView';

jest.mock('@patternfly/react-topology', () => ({
  VisualizationProvider: () => <div>VisualizationProvider</div>,
  Visualization: jest.fn().mockImplementation(() => ({
    registerLayoutFactory: () => {},
    registerComponentFactory: () => {},
    registerDecoratorFactory: () => {},
    registerDisplayFilter: () => {},
  })),
}));

jest.mock('../Graph/TopologyComponentFactory', () => ({
  TopologyComponentFactory: () => <div>TopologyComponentFactory</div>,
}));

describe('TopologyWorkloadView', () => {
  it('should render TopologyWorkloadView', () => {
    render(<TopologyWorkloadView />);
    expect(VisualizationProvider).toBeDefined();
  });
});

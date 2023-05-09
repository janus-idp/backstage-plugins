import React from 'react';
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
    const { getByText } = render(<TopologyWorkloadView />);
    expect(getByText(/visualizationprovider/i)).not.toBeNull();
  });
});

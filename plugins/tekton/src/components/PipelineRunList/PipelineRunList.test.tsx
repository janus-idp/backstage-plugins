import * as React from 'react';
import { render } from '@testing-library/react';
import PipelineRunList from './PipelineRunList';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';

describe('PipelineRunList', () => {
  it('should render PipelineRunList', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
    };

    const { getByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    expect(getByText(/List of Pipeline Runs/i)).not.toBeNull();
  });

  it('should render loading if data has not been loaded', () => {
    const mockContextData = {
      watchResourcesData: {},
      loaded: false,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
    };

    const { getByTestId } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    expect(getByTestId('tekton-progress')).not.toBeNull();
  });

  it('should show empty state if no data is available', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
        },
        taskruns: {
          data: [],
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
    };

    const { getByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    expect(getByText(/No Pipeline Runs found/i)).not.toBeNull();
  });
});

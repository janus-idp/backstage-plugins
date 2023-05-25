import React from 'react';
import { render } from '@testing-library/react';
import PipelineRunList from './PipelineRunList';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';

describe('PipelineRunList', () => {
  it('should render PipelineRunList if available', () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: mockKubernetesPlrResponse.pipelineruns,
        },
        taskruns: {
          data: mockKubernetesPlrResponse.taskruns,
        },
      },
      loaded: true,
      responseError: '',
      selectedClusterErrors: [],
      clusters: [],
      setSelectedCluster: () => {},
    };

    const { queryByText } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineRunList />
      </TektonResourcesContext.Provider>,
    );
    expect(queryByText(/No Pipeline Runs found/i)).toBeNull();
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

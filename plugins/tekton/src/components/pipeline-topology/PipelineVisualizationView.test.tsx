import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render } from '@testing-library/react';

import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { PipelineVisualizationView } from './PipelineVisualizationView';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useRouteRef: () => () => '/xyz',
}));

describe('PipelineVisualizationView', () => {
  it('should render the pipeline run visualization when pipelineRun name exists in the params', () => {
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
      selectedStatus: '',
      setSelectedStatus: () => {},
      setIsExpanded: () => {},
    };
    const { queryByTestId } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <BrowserRouter>
          <PipelineVisualizationView pipelineRun="pipeline-test-wbvtlk" />
        </BrowserRouter>
      </TektonResourcesContext.Provider>,
    );
    expect(queryByTestId('pipelineRun-visualization')).toBeInTheDocument();
  });
});

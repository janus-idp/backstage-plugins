import React from 'react';
import { render, screen } from '@testing-library/react';
import { PipelineVisualization } from './PipelineVisualization';
import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';

jest.mock('@backstage/plugin-catalog-react', () => ({
  useEntity: () => ({
    entity: {
      metadata: {
        name: 'test',
      },
    },
  }),
}));

describe('PipelineVisualization', () => {
  it('should render the pipeline run visualization when pipelineRun exists', async () => {
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
    const { queryByTestId } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineVisualization linkTekton={false} />
      </TektonResourcesContext.Provider>,
    );
    expect(
      screen.getByText(mockKubernetesPlrResponse.pipelineruns[1].metadata.name),
    ).toBeInTheDocument();

    expect(queryByTestId('pipeline-visualization')).not.toBeNull();
  });

  it('should show empty state when pipelineRun doesnot exist', async () => {
    const mockContextData = {
      watchResourcesData: {
        pipelineruns: {
          data: [],
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
        <PipelineVisualization />
      </TektonResourcesContext.Provider>,
    );
    expect(queryByText(/No Pipeline Run to visualize/i)).not.toBeNull();
  });

  it('should not render the visualization when no tasks exists for a pipelineRun', async () => {
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
    mockContextData.watchResourcesData.pipelineruns.data[1].status.pipelineSpec =
      {
        ...mockContextData.watchResourcesData.pipelineruns.data[1].status
          .pipelineSpec,
        tasks: [],
      };
    mockContextData.watchResourcesData.pipelineruns.data[1].status.pipelineSpec.finally =
      [];

    const { queryByTestId } = render(
      <TektonResourcesContext.Provider value={mockContextData}>
        <PipelineVisualization linkTekton={false} />
      </TektonResourcesContext.Provider>,
    );
    expect(
      screen.getByText('This Pipeline Run has no tasks to visualize'),
    ).toBeInTheDocument();

    expect(queryByTestId('pipeline-no-tasks')).not.toBeNull();
  });
});

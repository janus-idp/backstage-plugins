import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen } from '@testing-library/react';
import { setupRequestMockHandlers } from '@backstage/test-utils';
import { PipelineVisualization } from './PipelineVisualization';
import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';

describe('PipelineVisualization', () => {
  const server = setupServer();
  // Enable sane handlers for network requests
  setupRequestMockHandlers(server);

  // setup mock response
  beforeEach(() => {
    server.use(
      rest.get('/*', (_, res, ctx) => res(ctx.status(200), ctx.json({}))),
    );
  });

  it('should render the pipeline visualization when pipelineRun exists', async () => {
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
        <PipelineVisualization />
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
        <PipelineVisualization />
      </TektonResourcesContext.Provider>,
    );
    expect(
      screen.getByText('This Pipeline Run has no tasks to visualize'),
    ).toBeInTheDocument();

    expect(queryByTestId('pipeline-no-tasks')).not.toBeNull();
  });
});

import React from 'react';
import { cloneDeep } from 'lodash';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { ThemeProvider } from '@material-ui/core';
import { lightTheme } from '@backstage/theme';
import { render, screen } from '@testing-library/react';
import { setupRequestMockHandlers } from '@backstage/test-utils';
import { PipelineVisualization } from './PipelineVisualization';
import { mockKubernetesPlrResponse } from '../../__fixtures__/1-pipelinesData';

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
    const { queryByTestId } = render(
      <ThemeProvider theme={lightTheme}>
        <PipelineVisualization
          pipelineRun={mockKubernetesPlrResponse.pipelineruns[0]}
          taskRuns={mockKubernetesPlrResponse.taskruns}
        />
      </ThemeProvider>,
    );
    expect(
      screen.getByText(mockKubernetesPlrResponse.pipelineruns[0].metadata.name),
    ).toBeInTheDocument();

    expect(queryByTestId('pipeline-visualization')).not.toBeNull();
  });

  it('should render the pipeline visualization when taskRuns associated with the pipelineRun is empty', async () => {
    const pipelineRun = cloneDeep(mockKubernetesPlrResponse.pipelineruns[0]);
    const { queryByTestId } = render(
      <ThemeProvider theme={lightTheme}>
        <PipelineVisualization pipelineRun={pipelineRun} taskRuns={[]} />
      </ThemeProvider>,
    );
    expect(
      screen.getByText(mockKubernetesPlrResponse.pipelineruns[0].metadata.name),
    ).toBeInTheDocument();

    expect(queryByTestId('pipeline-visualization')).not.toBeNull();
  });

  it('should render the no pipelineRun alert when pipelineRun doesnot exist', async () => {
    const { queryByTestId } = render(
      <ThemeProvider theme={lightTheme}>
        <PipelineVisualization pipelineRun={null} taskRuns={[]} />
      </ThemeProvider>,
    );
    expect(
      screen.getByText('No PipelineRun to visualize.'),
    ).toBeInTheDocument();

    expect(queryByTestId('no-pipelinerun-alert')).not.toBeNull();
  });

  it('should render the no tasks alert when no tasks exists for a pipelineRun', async () => {
    const pipelineRun = cloneDeep(mockKubernetesPlrResponse.pipelineruns[0]);
    pipelineRun.status.pipelineSpec.tasks = [];
    const { queryByTestId } = render(
      <ThemeProvider theme={lightTheme}>
        <PipelineVisualization pipelineRun={pipelineRun} taskRuns={[]} />
      </ThemeProvider>,
    );
    expect(
      screen.getByText('This PipelineRun has no tasks to visualize.'),
    ).toBeInTheDocument();

    expect(queryByTestId('no-tasks-alert')).not.toBeNull();
  });
});

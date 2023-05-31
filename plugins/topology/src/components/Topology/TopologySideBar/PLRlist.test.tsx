import React from 'react';

import { render } from '@testing-library/react';

import {
  mockPipeline,
  mockPipelineRun,
} from '../../../__fixtures__/tektonResources';
import PLRlist from './PLRlist';

describe('PLRlist', () => {
  it('shows the workload pipeline', () => {
    const pipelines = [mockPipeline];
    const { getByText } = render(
      <PLRlist pipelines={pipelines} pipelineRuns={[]} />,
    );

    pipelines.forEach(pipeline => {
      const pipelineName = getByText(pipeline.metadata.name);
      expect(pipelineName).toBeInTheDocument();
    });
  });

  it('renders the list of pipeline runs', () => {
    const pipelineRuns: any[] = [
      mockPipelineRun,
      {
        ...mockPipelineRun,
        metadata: {
          ...mockPipelineRun.metadata,
          name: 'nationalparks-py2-9591xb',
          uid: '974e5124-c6b4-49c1-8960-d64740f47020',
        },
      },
    ];
    const { getByText } = render(
      <PLRlist pipelines={[]} pipelineRuns={pipelineRuns} />,
    );

    pipelineRuns.forEach(pipelineRun => {
      const pipelineRunName = getByText(pipelineRun.metadata.name);
      expect(pipelineRunName).toBeInTheDocument();
    });
  });

  it('renders "No PipelineRuns found" when no pipeline runs exist', () => {
    const { getByText } = render(<PLRlist pipelines={[]} pipelineRuns={[]} />);
    const noPipelineRunsMessage = getByText(/no pipelineruns found/i);

    expect(noPipelineRunsMessage).toBeInTheDocument();
  });
});

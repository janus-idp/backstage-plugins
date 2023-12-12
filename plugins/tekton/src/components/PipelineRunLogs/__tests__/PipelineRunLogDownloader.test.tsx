import React from 'react';

import { render, screen } from '@testing-library/react';

import { testPipelineRunPods } from '../../../__fixtures__/pods-data';
import PipelineRunLogDownloader from '../PipelineRunLogDownloader';

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

describe('PipelineRunLogDownloader', () => {
  it('should not show download links', () => {
    const { pipelineRun } = testPipelineRunPods;
    render(
      <PipelineRunLogDownloader
        pods={[]}
        pipelineRun={pipelineRun}
        activeTask={undefined}
      />,
    );

    expect(screen.queryByTestId('download-task-logs')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('download-pipelinerun-logs'),
    ).not.toBeInTheDocument();
  });

  it('should return download links', () => {
    const { pipelineRun, pods } = testPipelineRunPods;
    render(
      <PipelineRunLogDownloader
        pods={pods}
        pipelineRun={pipelineRun}
        activeTask={undefined}
      />,
    );

    expect(screen.getByTestId('download-task-logs')).toBeInTheDocument();
    expect(screen.getByTestId('download-pipelinerun-logs')).toBeInTheDocument();
  });
});

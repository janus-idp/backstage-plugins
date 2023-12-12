import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { Theme } from '@material-ui/core';
import { render, screen } from '@testing-library/react';

import { testPipelineRunPods } from '../../../__fixtures__/pods-data';
import PipelineRunLogDialog from '../PipelineRunLogDialog';

jest.mock('@material-ui/styles', () => ({
  ...jest.requireActual('@material-ui/styles'),
  makeStyles: (cb: any) => (theme: Theme) =>
    cb({
      ...theme,
      spacing: () => 0,
      palette: { grey: { 500: 'grey' } },
    }),
}));

jest.mock('@backstage/core-components', () => ({
  ErrorBoundary: (props: any) => <>{props.children}</>,
}));

jest.mock('@backstage/core-plugin-api', () => ({
  ...jest.requireActual('@backstage/core-plugin-api'),
  useApi: jest.fn(),
}));

jest.mock('../PipelineRunLogs', () => () => <div>Pipeline run logs</div>);

describe('PipelineRunLogDialog', () => {
  beforeEach(() => {
    (useApi as any).mockReturnValue({
      getPodLogs: jest.fn().mockResolvedValue({ text: 'log data...' }),
    });
  });
  it('should not show pipeline run logs modal', () => {
    const closeDialog = jest.fn();
    render(
      <PipelineRunLogDialog
        open={false}
        closeDialog={closeDialog}
        pods={[]}
        taskRuns={[]}
        pipelineRun={testPipelineRunPods.pipelineRun}
      />,
    );

    expect(
      screen.queryByTestId('pipelinerun-logs-dialog'),
    ).not.toBeInTheDocument();
  });

  it('should show pipeline run logs modal', () => {
    const closeDialog = jest.fn();
    render(
      <PipelineRunLogDialog
        open
        closeDialog={closeDialog}
        pods={[]}
        taskRuns={[]}
        pipelineRun={testPipelineRunPods.pipelineRun}
      />,
    );

    expect(screen.getByTestId('pipelinerun-logs-dialog')).toBeInTheDocument();
  });

  it('should not show download links in the logs modal if there are no pods', () => {
    const closeDialog = jest.fn();
    render(
      <PipelineRunLogDialog
        open
        closeDialog={closeDialog}
        pods={[]}
        taskRuns={[]}
        pipelineRun={testPipelineRunPods.pipelineRun}
      />,
    );

    expect(screen.getByTestId('pipelinerun-logs-dialog')).toBeInTheDocument();

    expect(
      screen.queryByTestId('pipelinerun-logs-downloader'),
    ).not.toBeInTheDocument();
  });

  it('should show download links in the logs modal if pods are available', () => {
    const closeDialog = jest.fn();
    render(
      <PipelineRunLogDialog
        open
        closeDialog={closeDialog}
        pods={testPipelineRunPods.pods}
        taskRuns={[]}
        pipelineRun={testPipelineRunPods.pipelineRun}
      />,
    );

    expect(screen.getByTestId('pipelinerun-logs-dialog')).toBeInTheDocument();
    expect(
      screen.queryByTestId('pipelinerun-logs-downloader'),
    ).toBeInTheDocument();
  });
});

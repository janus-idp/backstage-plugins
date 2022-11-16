/* ignore lint error for internal dependencies */
/* eslint-disable */
import { PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common';
/* eslint-enable */
import { wrapInTestApp } from '@backstage/test-utils';
import { render, waitFor } from '@testing-library/react';
import { TektonDashboardComponent } from './TektonDashboardComponent';
import { Entity } from '@backstage/catalog-model';
import { act } from '@testing-library/react';
import React from 'react';
import { TektonBackendClientMock } from '../../api/TektonBackendClientMock';
import { getTektonApi } from '../../api/types';
import pipelineRunFileMock from './__fixtures__/pipelinerun.json';

jest.mock('../../api/types');

describe('TektonDashboardComponent', () => {
  it('renders the progress bar and then empty Dashboard', async () => {
    const pipelineRuns = [] as PipelineRun[];
    const tektonBackendClientMock = new TektonBackendClientMock(pipelineRuns);
    const request = {} as Entity;

    jest.useFakeTimers();

    (getTektonApi as jest.Mock).mockReturnValueOnce(tektonBackendClientMock);

    const { debug, queryByRole, queryByText } = render(
      wrapInTestApp(
        <TektonDashboardComponent entity={request} refreshIntervalMs={1000} />,
      ),
    );

    await waitFor(() => {
      debug();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      debug();
      expect(queryByText('PipelineRuns')).not.toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      debug();
      expect(queryByRole('progress')).not.toBeInTheDocument();
      expect(queryByText('PipelineRuns')).toBeInTheDocument();
    });
  });

  it('renders the progress bar and then Dashboard', async () => {
    
    const pipelienRun = pipelineRunFileMock as unknown as PipelineRun;
    const pipelineRuns = [pipelienRun] as PipelineRun[];
    const tektonBackendClientMock = new TektonBackendClientMock(pipelineRuns);
    const request = {} as Entity;

    jest.useFakeTimers();

    (getTektonApi as jest.Mock).mockReturnValueOnce(tektonBackendClientMock);

    const { debug, queryByRole, queryByText, queryByTestId } = render(
      wrapInTestApp(
        <TektonDashboardComponent entity={request} refreshIntervalMs={1000} />,
      ),
    );

    await waitFor(() => {
      debug();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      debug();
      expect(queryByText('PipelineRuns')).not.toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      debug();
      expect(queryByRole('progress')).not.toBeInTheDocument();
      expect(queryByText('PipelineRuns')).toBeInTheDocument();
      expect(queryByTestId('collapsible-table-container')).toBeInTheDocument();
    });
  });
  it('renders the progress bar and then error', async () => {
    const pipelineRuns = [] as PipelineRun[];
    const tektonBackendClientMock = new TektonBackendClientMock(
      pipelineRuns,
      'error404',
    );
    const request = {} as Entity;

    jest.useFakeTimers();

    (getTektonApi as jest.Mock).mockReturnValueOnce(tektonBackendClientMock);

    const { debug, queryByRole, queryByText } = render(
      wrapInTestApp(
        <TektonDashboardComponent entity={request} refreshIntervalMs={1000} />,
      ),
    );

    await waitFor(() => {
      debug();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      debug();
      expect(queryByText('PipelineRuns')).not.toBeInTheDocument();
      expect(queryByText('Error: error404')).not.toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      debug();
      expect(queryByRole('progress')).not.toBeInTheDocument();
      expect(queryByText('PipelineRuns')).not.toBeInTheDocument();
      expect(queryByText('Error: error404')).toBeInTheDocument();
    });
  });
});

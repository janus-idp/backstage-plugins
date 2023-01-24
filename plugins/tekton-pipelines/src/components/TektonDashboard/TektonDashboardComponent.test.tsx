/* ignore lint error for internal dependencies */
/* eslint-disable */
import { Cluster, PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common';
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
import clusterFileMock from './__fixtures__/cluster.json';
import clustersFileMock from './__fixtures__/clusters.json';

jest.mock('../../api/types');

describe('TektonDashboardComponent', () => {
  it('renders the progress bar and then empty Dashboard', async () => {
    const clusters = [] as Cluster[]
    const pipelineRuns = [] as PipelineRun[];
    const logs = "";
    const tektonBackendClientMock = new TektonBackendClientMock(clusters, logs);
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
    const cluster = clusterFileMock as unknown as Cluster;
    const clusters = clustersFileMock as unknown as Cluster[]
    const pipelineRuns = [pipelienRun] as PipelineRun[];
    cluster.name = "Cluster1"
    cluster.pipelineRuns = pipelineRuns
    const logs = "";
    const tektonBackendClientMock = new TektonBackendClientMock(clusters, logs);
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
    });
  });
  it('renders the progress bar and then error', async () => {
    const clusters = [] as Cluster[];
    const logs = "";
    const tektonBackendClientMock = new TektonBackendClientMock(
      clusters,
      logs,
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

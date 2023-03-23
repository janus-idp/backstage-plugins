import * as React from 'react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { TestApiProvider } from '@backstage/test-utils';
import {
  Cluster,
  PipelineRun,
  PipelineRunsByEntityRequest,
} from '@jquad-group/plugin-tekton-pipelines-common';
import { tektonPlugin, TektonPage } from '../src/plugin';
import { TektonApi, tektonApiRef } from '@jquad-group/plugin-tekton-pipelines';
import { pipelineRunMock } from '../src/__fixtures__/mockPipelinesData';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'dice-roller',
      'tektonci/build-namespace': 'sample-go-application-build',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockTektonClient implements TektonApi {
  getLogs(
    _baseUrl: string,
    _authorizationBearerToken: string,
    _namespace: string,
    _taskRunPodName: string,
    _stepContainer: string,
  ): Promise<string> {
    const logMock = Promise.resolve('this is example log');
    return logMock;
  }

  async getHealth(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  async getPipelineRuns(
    _request: PipelineRunsByEntityRequest,
    _name: string,
    _baseUrl: string,
    _authorizationBearerToken: string,
    _namespace: string,
    _selector: string,
    _dashboardBaseUrl: string,
  ): Promise<Cluster[]> {
    const pipelineRuns: PipelineRun[] = [];
    pipelineRuns.push(pipelineRunMock);
    const tempCluster = {} as Cluster;
    tempCluster.name = 'Cluster1';
    tempCluster.pipelineRuns = pipelineRuns;
    const clusters: Cluster[] = [];
    clusters.push(tempCluster);
    return clusters;
  }
}

createDevApp()
  .registerPlugin(tektonPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[tektonApiRef, new MockTektonClient()]]}>
        <EntityProvider entity={mockEntity}>
          <TektonPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Pipelines page',
    path: '/pipelines',
  })
  .render();

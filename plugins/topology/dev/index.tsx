import React from 'react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { topologyPlugin, TopologyPage } from '../src/plugin';
import {
  EntityKubernetesContent,
  KubernetesApi,
  kubernetesApiRef,
} from '@backstage/plugin-kubernetes';
import { TestApiProvider } from '@backstage/test-utils';
import deployment from '../src/__fixtures__/1-deployments.json';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'backstage',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockKubernetesClient implements KubernetesApi {
  readonly resources;

  constructor(fixtureData: { [resourceType: string]: any[] }) {
    this.resources = Object.entries(fixtureData).flatMap(
      ([type, resources]) => ({
        type: type.toLocaleLowerCase('en-US'),
        resources,
      }),
    );
  }
  async getWorkloadsByEntity(_request: any): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }
  async getCustomObjectsByEntity(_request: any): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }

  async getObjectsByEntity(): Promise<any> {
    return {
      items: [
        {
          cluster: { name: 'mock-cluster' },
          resources: this.resources,
          podMetrics: [],
          errors: [],
        },
      ],
    };
  }

  async getClusters(): Promise<{ name: string; authProvider: string }[]> {
    return [{ name: 'mock-cluster', authProvider: 'serviceAccount' }];
  }
}

createDevApp()
  .addPage({
    element: (
      <TestApiProvider
        apis={[[kubernetesApiRef, new MockKubernetesClient(deployment)]]}
      >
        <EntityProvider entity={mockEntity}>
          <div style={{ height: '100vh' }}>
            <TopologyPage />
          </div>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Topology Page',
    path: '/topology',
  })
  .addPage({
    element: (
      <TestApiProvider
        apis={[[kubernetesApiRef, new MockKubernetesClient(deployment)]]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityKubernetesContent />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'k8s Page',
    path: '/kubernetes',
  })
  .registerPlugin(topologyPlugin)
  .render();

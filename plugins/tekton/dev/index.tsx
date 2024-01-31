import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import {
  EntityKubernetesContent,
  KubernetesApi,
  kubernetesApiRef,
  KubernetesProxyApi,
  kubernetesProxyApiRef,
} from '@backstage/plugin-kubernetes';
import { TestApiProvider } from '@backstage/test-utils';

import { mockKubernetesPlrResponse } from '../src/__fixtures__/1-pipelinesData';
import {
  acsDeploymentCheck,
  acsImageCheckResults,
  acsImageScanResult,
} from '../src/__fixtures__/advancedClusterSecurityData';
import { enterpriseContractResult } from '../src/__fixtures__/enterpriseContractData';
import { TektonCI, tektonPlugin } from '../src/plugin';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-id': 'backstage',
      'janus-idp.io/tekton': 'app',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockKubernetesProxyApi implements KubernetesProxyApi {
  async getPodLogs(_request: any): Promise<any> {
    const delayedResponse = (data: string, ms: number) =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            text: data,
          });
        }, ms);
      });

    if (_request.podName.includes('ec-task')) {
      return delayedResponse(JSON.stringify(enterpriseContractResult), 100);
    }

    if (_request.podName.includes('image-scan-task')) {
      return delayedResponse(JSON.stringify(acsImageScanResult), 200);
    }

    if (_request.podName.includes('image-check-task')) {
      return delayedResponse(JSON.stringify(acsImageCheckResults), 300);
    }

    if (_request.podName.includes('deployment-check-task')) {
      return delayedResponse(JSON.stringify(acsDeploymentCheck), 400);
    }

    const response = `\nstreaming logs from container: ${_request.containerName} \n...`;
    return delayedResponse(response, 500);
  }

  async getEventsByInvolvedObjectName(): Promise<any> {
    return {};
  }
}
class MockKubernetesClient implements KubernetesApi {
  readonly resources;

  constructor(fixtureData: { [resourceType: string]: any[] }) {
    this.resources = Object.entries(fixtureData).flatMap(
      ([type, resources]) => {
        if (type === 'pipelineruns' && resources[0]?.kind === 'PipelineRun') {
          return {
            type: 'customresources',
            resources,
          };
        } else if (type === 'taskruns' && resources[0]?.kind === 'TaskRun') {
          return {
            type: 'customresources',
            resources,
          };
        }
        return {
          type: type.toLocaleLowerCase('en-US'),
          resources,
        };
      },
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

  async getCluster(_clusterName: string): Promise<
    | {
        name: string;
        authProvider: string;
        oidcTokenProvider?: string;
        dashboardUrl?: string;
      }
    | undefined
  > {
    return { name: 'mock-cluster', authProvider: 'serviceAccount' };
  }

  async proxy(_options: { clusterName: String; path: String }): Promise<any> {
    return {
      kind: 'Namespace',
      apiVersion: 'v1',
      metadata: {
        name: 'mock-ns',
      },
    };
  }
}

createDevApp()
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [
            kubernetesApiRef,
            new MockKubernetesClient(mockKubernetesPlrResponse),
          ],
          [kubernetesProxyApiRef, new MockKubernetesProxyApi()],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <TektonCI />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Tekton CI',
    path: '/tekton',
  })
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [
            kubernetesApiRef,
            new MockKubernetesClient(mockKubernetesPlrResponse),
          ],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <EntityKubernetesContent />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'k8s Page',
    path: '/kubernetes',
  })
  .registerPlugin(tektonPlugin)
  .render();

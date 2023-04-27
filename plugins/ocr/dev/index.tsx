import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { OcrPage, ocrPlugin } from '../src/plugin';
import {
  KubernetesApi,
  kubernetesApiRef,
} from '@backstage/plugin-kubernetes';
import { TestApiProvider } from '@backstage/test-utils';
import { mockKubernetesIsResponse } from '../src/__fixtures__/mockKubernetesIsResponse';

class MockKubernetesClient implements KubernetesApi {
  readonly resources;

  constructor(fixtureData: { [resourceType: string]: any[] }) {
    this.resources = Object.entries(fixtureData).flatMap(
      ([type, resources]) => {
        if (type === 'imagestreams' && resources[0]?.kind === 'ImageStream') {
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
}


createDevApp()
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [
            kubernetesApiRef,
            new MockKubernetesClient(mockKubernetesIsResponse),
          ],
        ]}
      >
        <OcrPage />
      </TestApiProvider>
    ),
    title: 'Image Registry',
    path: '/ocr',
  })
  .registerPlugin(ocrPlugin)
  .render();

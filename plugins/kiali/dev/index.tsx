import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';

import {
  FetchResponse,
  FetchResponseWrapper,
} from '@janus-idp/backstage-plugin-kiali-common';

import { KialiApi, kialiApiRef } from '../src/api';
import { KialiPage, kialiPlugin } from '../src/plugin';
import overviewJson from './__fixtures__/1-overview.json';
import configJson from './__fixtures__/config.json';
import statusJson from './__fixtures__/status.json';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'backstage.io/kubernetes-namespace': 'istio-system,bookinfo',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

class MockKialiClient implements KialiApi {
  readonly resource: FetchResponse;
  readonly status: FetchResponse;
  readonly config: FetchResponse;

  constructor(
    fixtureData: any,
    status: any = statusJson,
    config: any = configJson,
  ) {
    this.resource = fixtureData;
    this.status = status;
    this.config = config;
  }

  setEntity(_: Entity): void {}

  async getConfig(): Promise<FetchResponseWrapper> {
    return {
      errors: [],
      warnings: [],
      response: this.config,
    };
  }

  async getInfo(): Promise<FetchResponseWrapper> {
    return {
      errors: [],
      warnings: [],
      response: this.status,
    };
  }

  async getOverview(): Promise<FetchResponseWrapper> {
    return {
      errors: [],
      warnings: [],
      response: this.resource,
    };
  }
}

createDevApp()
  .registerPlugin(kialiPlugin)
  .addPage({
    element: (
      <TestApiProvider
        apis={[[kialiApiRef, new MockKialiClient(overviewJson)]]}
      >
        <EntityProvider entity={mockEntity}>
          <KialiPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Kiali Plugin Page',
    path: '/kiali',
  })
  .addPage({
    element: (
      <TestApiProvider
        apis={[[kialiApiRef, new MockKialiClient(overviewJson)]]}
      >
        <EntityProvider entity={mockEntity}>
          <KialiPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Overview Page',
    path: '/kiali/overview',
  })
  .render();

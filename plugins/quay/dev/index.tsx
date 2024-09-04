import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { permissionApiRef } from '@backstage/plugin-permission-react';
import { MockPermissionApi, TestApiProvider } from '@backstage/test-utils';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { quayApiRef, QuayApiV1 } from '../src/api';
import { QuayPage, quayPlugin } from '../src/plugin';
import { labels } from './__data__/labels';
import { manifestDigest } from './__data__/manifest_digest';
import {
  securityDetails,
  v1securityDetails,
  v2securityDetails,
  v3securityDetails,
} from './__data__/security_vulnerabilities';
import { tags } from './__data__/tags';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'quay.io/repository-slug': 'backstage-test/test-images',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

export class MockQuayApiClient implements QuayApiV1 {
  async getTags() {
    return tags;
  }

  async getLabels() {
    return labels;
  }

  async getManifestByDigest() {
    return manifestDigest;
  }

  async getSecurityDetails(_: string, __: string, digest: string) {
    if (
      digest ===
      'sha256:79c96c750aa532d92d9cb56cad59159b7cc26b10e39ff4a895c28345d2cd775d'
    ) {
      return v3securityDetails;
    }

    if (
      digest ===
      'sha256:89c96c750aa532d92d9cb56cad59159b7cc26b10e39ff4a895c28345d2cd775e'
    ) {
      return v2securityDetails;
    }
    if (
      digest ===
      'sha256:99c96c750aa532d92d9cb56cad59159b7cc26b10e39ff4a895c28345d2cd775f'
    ) {
      return v1securityDetails;
    }

    return securityDetails;
  }
}
const mockPermissionApi = new MockPermissionApi();

createDevApp()
  .registerPlugin(quayPlugin)
  .addThemes(getAllThemes())
  .addPage({
    element: (
      <TestApiProvider
        apis={[
          [quayApiRef, new MockQuayApiClient()],
          [permissionApiRef, mockPermissionApi],
        ]}
      >
        <EntityProvider entity={mockEntity}>
          <QuayPage />
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/quay',
  })
  .render();

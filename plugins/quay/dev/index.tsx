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
import { securityDetails } from './__data__/security_vulnerabilities';
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

  async getSecurityDetails() {
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

import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { QuayPage, quayPlugin } from '../src/plugin';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'quay.io/repository-slug': 'janus-idp/redhat-backstage-build',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

createDevApp()
  .registerPlugin(quayPlugin)
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <QuayPage />
      </EntityProvider>
    ),
    title: 'Root Page',
    path: '/quay',
  })
  .render();

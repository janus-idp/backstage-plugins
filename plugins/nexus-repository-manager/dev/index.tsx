import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import {
  NexusRepositoryManagerPage,
  nexusRepositoryManagerPlugin,
} from '../src/plugin';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'nexus-repository-manager/docker.image-name':
        'janus-idp/backstage-showcase',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

createDevApp()
  .registerPlugin(nexusRepositoryManagerPlugin)
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <NexusRepositoryManagerPage />
      </EntityProvider>
    ),
    title: 'Root Page',
    path: '/nexus-repository-manager',
  })
  .render();

import React from 'react';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { topologyPlugin, TopologyPage } from '../src/plugin';

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

createDevApp()
  .registerPlugin(topologyPlugin)
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <div style={{ height: '100vh' }}>
          <TopologyPage />
        </div>
      </EntityProvider>
    ),
    title: 'Root Page',
    path: '/topology',
  })
  .render();

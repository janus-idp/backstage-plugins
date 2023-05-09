import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';

import { KialiPage, kialiPlugin } from '../src/plugin';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'Kiali',
    description: 'kiali.io',
    annotations: {
      'backstage.io/kubernetes-namespace': 'istio-system',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

createDevApp()
  .registerPlugin(kialiPlugin)
  .addPage({
    element: <KialiPage entity={mockEntity} />,
    title: 'Root Page',
    path: '/kiali',
  })
  .render();

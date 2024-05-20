import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { QuayPage, quayPlugin } from '../src/plugin';

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

createDevApp()
  .registerPlugin(quayPlugin)
  .addThemes(createDevAppThemes())
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

import React from 'react';

import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { JfrogArtifactoryPage, jfrogArtifactoryPlugin } from '../src/plugin';

const mockEntity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    description: 'backstage.io',
    annotations: {
      'jfrog-artifactory/image-name': 'backstage',
    },
  },
  spec: {
    lifecycle: 'production',
    type: 'service',
    owner: 'user:guest',
  },
};

createDevApp()
  .registerPlugin(jfrogArtifactoryPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    element: (
      <EntityProvider entity={mockEntity}>
        <JfrogArtifactoryPage />
      </EntityProvider>
    ),
    title: 'Root Page',
    path: '/artifactory',
  })
  .render();

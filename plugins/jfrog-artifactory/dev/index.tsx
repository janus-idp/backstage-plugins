import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { jfrogArtifactoryPlugin, JfrogArtifactoryPage } from '../src/plugin';

createDevApp()
  .registerPlugin(jfrogArtifactoryPlugin)
  .addPage({
    element: <JfrogArtifactoryPage />,
    title: 'Root Page',
    path: '/artifactory',
  })
  .render();

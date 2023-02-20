import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { orionPlugin, OrionPage } from '../src/plugin';

createDevApp()
  .registerPlugin(orionPlugin)
  .addPage({
    element: <OrionPage />,
    title: 'Root Page',
    path: '/orion'
  })
  .render();

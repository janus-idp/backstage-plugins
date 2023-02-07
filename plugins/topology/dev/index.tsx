import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { topologyPlugin, TopologyPage } from '../src/plugin';

createDevApp()
  .registerPlugin(topologyPlugin)
  .addPage({
    element: <TopologyPage />,
    title: 'Root Page',
    path: '/topology'
  })
  .render();

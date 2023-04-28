import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { acrPlugin, AcrPage } from '../src/plugin';

createDevApp()
  .registerPlugin(acrPlugin)
  .addPage({
    element: <AcrPage />,
    title: 'Root Page',
    path: '/acr'
  })
  .render();

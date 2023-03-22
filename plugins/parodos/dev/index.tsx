import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { parodosPlugin, ParodosPage } from '../src/plugin';

createDevApp()
  .registerPlugin(parodosPlugin)
  .addPage({
    element: <ParodosPage />,
    title: 'Root Page',
    path: '/parodos',
  })
  .render();

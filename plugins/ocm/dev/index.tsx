import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { ocmPlugin, OcmPage } from '../src/plugin';

createDevApp()
  .registerPlugin(ocmPlugin)
  .addPage({
    element: <OcmPage />,
    title: 'Root Page',
    path: '/ocm',
  })
  .render();

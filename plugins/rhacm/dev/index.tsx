import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { rhacmPlugin, RhacmPage } from '../src/plugin';

createDevApp()
  .registerPlugin(rhacmPlugin)
  .addPage({
    element: <RhacmPage />,
    title: 'Root Page',
    path: '/rhacm'
  })
  .render();

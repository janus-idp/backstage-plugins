import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { KialiPage, kialiPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(kialiPlugin)
  .addPage({
    element: <KialiPage />,
    title: 'Root Page',
    path: '/kiali',
  })
  .render();

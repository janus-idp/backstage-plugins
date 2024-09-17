import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { LightspeedPage, lightspeedPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(lightspeedPlugin)
  .addPage({
    element: <LightspeedPage />,
    title: 'Lightspeed Page',
    path: '/lightspeed',
  })
  .render();

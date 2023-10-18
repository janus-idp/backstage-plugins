import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { analyticsModuleMatomoPlugin } from '../src';
import { Playground } from './Playground';

createDevApp()
  .registerPlugin(analyticsModuleMatomoPlugin)
  .addPage({
    title: 'Matomo Analytics Playground',
    path: '/analytics-module-matomo',
    element: <Playground />,
  })
  .render();

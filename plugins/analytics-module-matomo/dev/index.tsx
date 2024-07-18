import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { analyticsModuleMatomoPlugin } from '../src';
import { Playground } from './Playground';

createDevApp()
  .registerPlugin(analyticsModuleMatomoPlugin)
  .addThemes(getAllThemes())
  .addPage({
    title: 'Matomo Analytics Playground',
    path: '/analytics-module-matomo',
    element: <Playground />,
  })
  .render();

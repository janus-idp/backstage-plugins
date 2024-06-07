import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { analyticsModuleMatomoPlugin } from '../src';
import { Playground } from './Playground';

createDevApp()
  .registerPlugin(analyticsModuleMatomoPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    title: 'Matomo Analytics Playground',
    path: '/analytics-module-matomo',
    element: <Playground />,
  })
  .render();

import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { MatomoPage, matomoPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(matomoPlugin)
  .addThemes(getAllThemes())
  .addPage({
    element: <MatomoPage />,
    title: 'Root Page',
    path: '/matomo',
  })
  .render();

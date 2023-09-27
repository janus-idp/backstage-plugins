import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { MatomoPage, matomoPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(matomoPlugin)
  .addPage({
    element: <MatomoPage />,
    title: 'Root Page',
    path: '/matomo',
  })
  .render();

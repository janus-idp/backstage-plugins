import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import {
  ParodosNotificationsPage,
  parodosNotificationsPlugin,
} from '../src/plugin';

createDevApp()
  .registerPlugin(parodosNotificationsPlugin)
  .addPage({
    element: <ParodosNotificationsPage />,
    title: 'Root Page',
    path: '/parodos-notifications',
  })
  .render();

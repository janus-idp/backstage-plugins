import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { getAllThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { NotificationsPage, notificationsPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(notificationsPlugin)
  .addThemes(getAllThemes())
  .addPage({
    element: <NotificationsPage />,
    title: 'Root Page',
    path: '/notifications',
  })
  .render();

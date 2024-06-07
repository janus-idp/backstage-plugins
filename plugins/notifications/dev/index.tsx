import React from 'react';

import { createDevApp } from '@backstage/dev-utils';

import { createDevAppThemes } from '@redhat-developer/red-hat-developer-hub-theme';

import { NotificationsPage, notificationsPlugin } from '../src/plugin';

createDevApp()
  .registerPlugin(notificationsPlugin)
  .addThemes(createDevAppThemes())
  .addPage({
    element: <NotificationsPage />,
    title: 'Root Page',
    path: '/notifications',
  })
  .render();

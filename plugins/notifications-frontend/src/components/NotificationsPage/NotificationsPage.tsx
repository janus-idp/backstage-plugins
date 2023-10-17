import React from 'react';

import { Page, RoutedTabs } from '@backstage/core-components';

import { PersonalNotifications } from '../PersonalNotifications';
import { SystemNotifications } from '../SystemNotifications';

export const NotificationsPage = () => (
  <Page themeId="tool">
    <RoutedTabs
      routes={[
        {
          path: 'personal',
          title: 'Personal',
          children: <PersonalNotifications />,
        },
        {
          path: 'updates',
          title: 'Updates',
          children: <SystemNotifications />,
        },
      ]}
    />
  </Page>
);

import React from 'react';

import { Page, RoutedTabs } from '@backstage/core-components';

import { MonitoringNotifications } from '../MonitoringNotifications';
import { PersonalNotifications } from '../PersonalNotifications';

export const ParodosPage = () => (
  <Page themeId="tool">
    <RoutedTabs
      routes={[
        {
          path: 'personal',
          title: 'Personal',
          children: <PersonalNotifications />,
        },
        {
          path: 'monitoring',
          title: 'Monitoring',
          children: <MonitoringNotifications />,
        },
      ]}
    />
  </Page>
);

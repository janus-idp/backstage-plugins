import React from 'react';

import { SidebarGroup, SidebarItem } from '@backstage/core-components';

import NotificationsIcon from '@material-ui/icons/Extension' /* TODO: change it */;

import { NOTIFICATIONS_ROUTE } from '../constants';

// TODO: make this a single item, probably no need for more
export const NotificationsSidebarGroup = () => (
  <SidebarGroup label="Notifications" icon={<NotificationsIcon />}>
    <SidebarItem
      icon={NotificationsIcon}
      to={NOTIFICATIONS_ROUTE}
      text="Notifications"
    />
  </SidebarGroup>
);

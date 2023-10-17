import React from 'react';

import { SidebarItem } from '@backstage/core-components';

import NotificationsIcon from '@material-ui/icons/Notifications';

import { NOTIFICATIONS_ROUTE } from '../constants';

export const NotificationsSidebarItem = () => (
  <SidebarItem
    icon={NotificationsIcon}
    to={NOTIFICATIONS_ROUTE}
    text="Notifications"
  />
);

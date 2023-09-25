import React from 'react';

import { SidebarGroup, SidebarItem } from '@backstage/core-components';

import NotificationsIcon from '@material-ui/icons/Extension' /* TODO */;
import ParodosIcon from '@material-ui/icons/Menu' /* TODO */;

import { PARODOS_NOTIFICATIONS_ROUTE } from '../constrants';

export const ParodosSidebarGroup = () => (
  <SidebarGroup label="Parodos" icon={<ParodosIcon />}>
    <SidebarItem
      icon={NotificationsIcon}
      to={PARODOS_NOTIFICATIONS_ROUTE}
      text="Notifications"
    />
  </SidebarGroup>
);

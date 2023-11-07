import React from 'react';

import { SidebarItem } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Tooltip } from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';

import { notificationsApiRef } from '../api';
import { NOTIFICATIONS_ROUTE } from '../constants';
import { usePollingEffect } from './usePollingEffect';

const NotificationsErrorIcon = () => (
  <Tooltip title="Failed to load notifications">
    <NotificationsOffIcon />
  </Tooltip>
);

export type NotificationsSidebarItemProps = {
  /**
   * Number of milliseconds between polling the notifications backend.
   * If negative or zero, the poling is not started.
   * Example: 5000
   */
  pollingInterval?: number;
};

export const NotificationsSidebarItem = ({
  pollingInterval,
}: NotificationsSidebarItemProps) => {
  const notificationsApi = useApi(notificationsApiRef);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const pollCallback = React.useCallback(async () => {
    try {
      setUnreadCount(
        await notificationsApi.getNotificationsCount({
          unreadOnly: true,
          user: 'jdoe' /* TODO: get logged-in user */,
          messageScope: 'user' /* TODO: parametrize that */,
        }),
      );
    } catch (e: unknown) {
      setError(e as Error);
    }
  }, [notificationsApi]);

  usePollingEffect(pollCallback, [], pollingInterval);

  let icon = NotificationsIcon;
  if (!!error) {
    icon = NotificationsErrorIcon;
  }

  return (
    <SidebarItem
      icon={icon}
      to={NOTIFICATIONS_ROUTE}
      text="Notifications"
      hasNotifications={!error && !!unreadCount}
    />
  );
};

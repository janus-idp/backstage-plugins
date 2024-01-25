import React from 'react';

import { configApiRef, useApi } from '@backstage/core-plugin-api';

import { Badge, Tooltip } from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/Notifications';
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';

import { notificationsApiRef } from '../../api';
import { DefaultPollingIntervalMs } from '../../constants';
import { Notification } from '../../openapi';
import { usePollingEffect } from '../usePollingEffect';
import { SystemNotificationAlert } from './SystemNotificationAlert';

const NotificationsErrorIcon = () => (
  <Tooltip title="Failed to load notifications">
    <NotificationsOffIcon />
  </Tooltip>
);

/**
 * Dynamic plugins recently do not support passing configuration
 * to icons or making the left-side menu item texts active (so far strings only).
 *
 * This Icon component tries to workaround these limitations but will be subject of
 * change as the extension points by dynamic plugins will evolve.
 */
export const NotificationsActiveIcon = () => {
  const notificationsApi = useApi(notificationsApiRef);
  const configApi = useApi(configApiRef);

  let pollingInterval = configApi.getOptionalNumber(
    'notifications.pollingIntervalMs',
  );
  if (pollingInterval === undefined) {
    pollingInterval = DefaultPollingIntervalMs;
  }

  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [pageLoadingTime] = React.useState(new Date(Date.now()));
  const [lastSystemWideNotification, setLastSystemWideNotification] =
    React.useState<Notification>();
  const [closedNotificationId, setClosedNotificationId] =
    React.useState<string>();

  const pollCallback = React.useCallback(async () => {
    try {
      setUnreadCount(
        await notificationsApi.getNotificationsCount({
          read: false,
          messageScope: 'user',
        }),
      );

      const data = await notificationsApi.getNotifications({
        pageSize: 1,
        pageNumber: 1,
        createdAfter: pageLoadingTime,
        orderBy: 'created',
        orderByDirec: 'desc',
        messageScope: 'system',
      });

      setLastSystemWideNotification(data?.[0]);
    } catch (e: unknown) {
      setError(e as Error);
    }
  }, [notificationsApi, pageLoadingTime]);

  usePollingEffect(pollCallback, [], pollingInterval);

  if (!!error) {
    return <NotificationsErrorIcon />;
  }

  const showSystemWideNotification =
    lastSystemWideNotification &&
    !lastSystemWideNotification.readByUser &&
    closedNotificationId !== lastSystemWideNotification.id;

  return (
    <>
      <Badge
        color="secondary"
        variant="dot"
        overlap="circular"
        invisible={unreadCount === 0}
      >
        <NotificationsIcon />
      </Badge>

      {showSystemWideNotification && (
        <SystemNotificationAlert
          message={lastSystemWideNotification.title}
          onCloseNotification={() =>
            setClosedNotificationId(lastSystemWideNotification.id)
          }
        />
      )}
    </>
  );
};

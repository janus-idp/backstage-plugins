import React, { useCallback } from 'react';

import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MarkAsReadIcon from '@material-ui/icons/Markunread' /* TODO: find a better component */;
import {
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core' /* TODO: avoid Patternfly, find a way how to get Split, Stack from Material UI */;

import { Notification, notificationsApiRef } from '../../api';
import { usePollingEffect } from '../usePollingEffect';

const useStyles = makeStyles({
  actionsList: {
    alignSelf: 'center',
  },
});

type DenseTableProps = {
  notifications: Notification[];
};

export const DenseTable = ({ notifications }: DenseTableProps) => {
  const classes = useStyles();
  const notificationsApi = useApi(notificationsApiRef);

  const handleMarkAsRead = React.useCallback(
    (notification: Notification) => {
      notificationsApi.markAsRead(notification.id);
    },
    [notificationsApi],
  );

  const columns: TableColumn[] = React.useMemo(
    () => [
      { title: 'Title', field: 'title' },
      { title: 'Message', field: 'message' },
      { title: 'Created', field: 'created' },
      { title: 'Topic', field: 'topic' },
      { title: 'Origin', field: 'origin' },
      // { title: 'ID', field: 'uuid' },
      {
        title: 'Actions',
        render: (row: unknown): React.ReactNode => {
          const notification = row as Notification;

          let actions;
          if (!!notification.actions?.length) {
            actions = (
              <SplitItem className={classes.actionsList}>
                <Stack>
                  {notification.actions.map(action => (
                    <StackItem key={action.url}>
                      <Link to={action.url}>{action.title || 'More info'}</Link>
                    </StackItem>
                  ))}
                </Stack>
              </SplitItem>
            );
          }

          return (
            <Split hasGutter>
              <SplitItem>
                <Tooltip title="Mark as read">
                  <IconButton
                    onClick={() => {
                      handleMarkAsRead(notification);
                    }}
                  >
                    <MarkAsReadIcon aria-label="Mark as read" />
                  </IconButton>
                </Tooltip>
              </SplitItem>
              {actions}
            </Split>
          );
        },
      },
    ],
    [classes.actionsList, handleMarkAsRead],
  );

  const data = notifications.map(notification => {
    // TODO: additional mapping between the Notification type and the table
    return {
      ...notification,
    };
  });

  return (
    <Table
      title="Notifications"
      options={{ search: true, paging: true }}
      columns={columns}
      data={data}
    />
  );
};

export const NotificationsTable = () => {
  const notificationsApi = useApi(notificationsApiRef);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  /*
    TODO: avoid polling
    Do initial load
     - size
     - page one
    On page navigation or markAsRead or filter params, read
     - size
     - requested page
    TODO: include "count" in the paginated response to avoid two calls
  */
  const pollCallback = useCallback(async () => {
    try {
      setNotifications(await notificationsApi.getNotifications(/* params */));
    } catch (e: unknown) {
      setError(e as Error);
    }
  }, [notificationsApi]);

  usePollingEffect(pollCallback, [
    /* params */
  ]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable notifications={notifications} />;
};

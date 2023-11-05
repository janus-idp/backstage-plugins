import React from 'react';
import { useAsync } from 'react-use';

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
import {
  CreatedAfterOptions,
  NotificationsToolbar,
} from './NotificationsToolbar';

const useStyles = makeStyles({
  actionsList: {
    alignSelf: 'center',
  },
});

export const NotificationsTable = () => {
  const notificationsApi = useApi(notificationsApiRef);
  const classes = useStyles();
  const [pageNumber, setPageNumber] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);
  const [containsText, setContainsText] = React.useState<string | undefined>(
    undefined,
  );
  const [createdAfter, setCreatedAfter] = React.useState<string>('lastWeek');

  const onMarkAsRead = React.useCallback(
    (notification: Notification) => {
      notificationsApi.markAsRead(notification.id);
    },
    [notificationsApi],
  );

  const { loading, value, error } = useAsync(async (): Promise<{
    notifications: Notification[];
    totalCount: number;
  }> => {
    const createdAfterDate = CreatedAfterOptions[createdAfter].getDate();

    const data = await notificationsApi.getNotifications({
      pageSize,
      pageNumber: pageNumber + 1 /* BE starts at 1 */,
      containsText,
      createdAfter: createdAfterDate,
    });
    // TODO: extend BE to get both in a single query/response
    const total = await notificationsApi.getNotificationsCount({
      unreadOnly: false,
      containsText,
    });

    return {
      notifications: data,
      totalCount: total,
    };
  }, [pageNumber, pageSize, containsText, createdAfter]);

  const actionsColumn: TableColumn<Notification> = React.useMemo(
    () => ({
      title: 'Actions',
      render: (notification: Notification): React.ReactNode => {
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
                    onMarkAsRead(notification);
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
    }),
    [classes.actionsList, onMarkAsRead],
  );

  const columns = React.useMemo(
    (): TableColumn<Notification>[] => [
      { title: 'Title', field: 'title' },
      { title: 'Message', field: 'message' },
      { title: 'Created', field: 'created', type: 'datetime' },
      { title: 'Topic', field: 'topic' },
      { title: 'Origin', field: 'origin' },
      // { title: 'ID', field: 'uuid' },
      actionsColumn,
    ],
    [actionsColumn],
  );

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const data =
    value?.notifications.map(notification => {
      // Provide additional mapping between the Notification type and the table
      return {
        ...notification,
      };
    }) || [];

  return (
    <Table<Notification>
      isLoading={loading}
      options={{ search: true, paging: true, pageSize }}
      columns={columns}
      data={data}
      onPageChange={setPageNumber}
      onRowsPerPageChange={setPageSize}
      page={pageNumber}
      totalCount={value?.totalCount}
      onSearchChange={setContainsText}
      components={{
        Toolbar: props => (
          <NotificationsToolbar
            {...props}
            createdAfter={createdAfter}
            onCreatedAfterChanged={setCreatedAfter}
          />
        ),
      }}
    />
  );
};

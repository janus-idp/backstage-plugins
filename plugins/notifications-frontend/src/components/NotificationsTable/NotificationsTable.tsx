import React from 'react';
import { useAsync } from 'react-use';

import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { MaterialTableProps } from '@material-table/core';
import { Grid, IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MarkAsReadIcon from '@material-ui/icons/Markunread' /* TODO: find a better component */;
import Stack from '@mui/material/Stack';

import {
  Notification,
  notificationsApiRef,
  NotificationsFilter,
  NotificationsQuerySorting,
} from '../../api';
import {
  CreatedAfterOptions,
  NotificationsToolbar,
} from './NotificationsToolbar';

const useStyles = makeStyles({
  actionsList: {
    alignSelf: 'center',
  },
});

export type NotificationsTableProps = {
  messageScope: NonNullable<NotificationsFilter['messageScope']>;
};

export const NotificationsTable = ({
  messageScope,
}: NotificationsTableProps) => {
  const notificationsApi = useApi(notificationsApiRef);
  const classes = useStyles();
  const [pageNumber, setPageNumber] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);
  const [containsText, setContainsText] = React.useState<string | undefined>(
    undefined,
  );
  const [createdAfter, setCreatedAfter] = React.useState<string>('lastWeek');
  const [sorting, setSorting] = React.useState<
    NotificationsQuerySorting | undefined
  >();

  // TODO: get the name of logged-in user
  const user = 'jdoe';

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
      sorting,
      user,
      messageScope,
    });
    // TODO: extend BE to get both in a single query/response
    const total = await notificationsApi.getNotificationsCount({
      unreadOnly: false,
      containsText,
      user,
      messageScope,
    });

    return {
      notifications: data,
      totalCount: total,
    };
  }, [pageNumber, pageSize, containsText, createdAfter, sorting]);

  const actionsColumn: TableColumn<Notification> = React.useMemo(
    () => ({
      title: 'Actions',
      render: (notification: Notification): React.ReactNode => {
        let actions;
        if (!!notification.actions?.length) {
          actions = (
            <Stack>
              {notification.actions.map(action => (
                <Link key={action.url} to={action.url}>
                  {action.title || 'More info'}
                </Link>
              ))}
            </Stack>
          );
        }

        return (
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Tooltip title="Mark as read">
                <IconButton
                  onClick={() => {
                    onMarkAsRead(notification);
                  }}
                >
                  <MarkAsReadIcon aria-label="Mark as read" />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item className={classes.actionsList} xs={9}>
              {actions}
            </Grid>
          </Grid>
        );
      },
    }),
    [classes.actionsList, onMarkAsRead],
  );

  const onOrderChange = React.useCallback<
    NonNullable<MaterialTableProps<Notification>['onOrderChange']>
  >((orderBy, direction) => {
    if (orderBy < 0) {
      setSorting(undefined);
      return;
    }

    const fieldNames: NotificationsQuerySorting['fieldName'][] = [
      /* Keep the order in sync with the column definitions */
      'title',
      'message',
      'created',
      'topic',
      'origin',
    ];
    const fieldName = fieldNames[orderBy];

    setSorting({ fieldName, direction });
  }, []);

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
      onOrderChange={onOrderChange}
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

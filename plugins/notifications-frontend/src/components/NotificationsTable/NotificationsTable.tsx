import React from 'react';
import { useAsync } from 'react-use';

import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  Notification,
  NotificationsQuerySorting,
} from '@backstage/plugin-notifications-common';

import { MaterialTableProps } from '@material-table/core';
import { Grid, IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MarkAsReadIcon from '@material-ui/icons/CheckCircle';

import { notificationsApiRef, NotificationsFilter } from '../../api';
import MarkAsUnreadIcon from './MarkAsUnreadIcon';
import {
  CreatedAfterOptions,
  NotificationsToolbar,
} from './NotificationsToolbar';

const useStyles = makeStyles({
  actionsRoot: {
    justifyContent: 'space-between',
    paddingRight: '1rem',
  },
  readActionIcon: {
    color: 'black',
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
  const [unreadOnly, setUnreadOnly] = React.useState(true);
  const [sorting, setSorting] = React.useState<
    NotificationsQuerySorting | undefined
  >();
  const [reload, setReload] = React.useState(0);

  const onMarkAsReadSwitch = React.useCallback(
    (notification: Notification) => {
      notificationsApi
        .markAsRead({
          notificationId: notification.id,
          isRead: !notification.readByUser,
        })
        .then(() => setReload(Date.now()));
    },
    [notificationsApi],
  );

  const { loading, value, error } = useAsync(async (): Promise<{
    notifications: Notification[];
    totalCount: number;
  }> => {
    const createdAfterDate = CreatedAfterOptions[createdAfter].getDate();

    const commonParams: NotificationsFilter = {
      containsText,
      createdAfter: createdAfterDate,
      messageScope,
    };

    if (unreadOnly !== undefined) {
      commonParams.isRead = !unreadOnly;
    }

    const data = await notificationsApi.getNotifications({
      ...commonParams,
      pageSize,
      pageNumber: pageNumber + 1 /* BE starts at 1 */,
      sorting,
    });
    // TODO: extend BE to get both in a single query/response
    const total = await notificationsApi.getNotificationsCount({
      ...commonParams,
    });

    return {
      notifications: data,
      totalCount: total,
    };
  }, [
    pageNumber,
    pageSize,
    containsText,
    createdAfter,
    sorting,
    unreadOnly,
    reload,
  ]);

  const actionsColumn: TableColumn<Notification> = React.useMemo(
    () => ({
      title: 'Actions',
      render: (notification: Notification): React.ReactNode => {
        let actions;
        if (!!notification.actions?.length) {
          actions = (
            <Grid container>
              {notification.actions.map(action => (
                <Grid item>
                  <Link key={action.url} to={action.url}>
                    {action.title || 'More info'}
                  </Link>
                </Grid>
              ))}
            </Grid>
          );
        }

        const markAsReadText = notification.readByUser
          ? 'Return among unread'
          : 'Mark as read';
        const IconComponent = notification.readByUser
          ? MarkAsUnreadIcon
          : MarkAsReadIcon;

        return (
          <Grid container spacing={1} className={classes.actionsRoot}>
            <Grid item xs={9}>
              {actions}
            </Grid>

            <Grid item xs={2}>
              <Tooltip title={markAsReadText}>
                <IconButton
                  onClick={() => {
                    onMarkAsReadSwitch(notification);
                  }}
                >
                  <IconComponent
                    aria-label={markAsReadText}
                    className={classes.readActionIcon}
                  />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        );
      },
    }),
    [classes.actionsRoot, classes.readActionIcon, onMarkAsReadSwitch],
  );

  const onOrderChange = React.useCallback<
    NonNullable<MaterialTableProps<Notification>['onOrderChange']>
  >((orderBy, direction) => {
    if (orderBy < 0) {
      setSorting(undefined);
      return;
    }

    const fieldNames: NotificationsQuerySorting['fieldName'][] = [
      /* Keep the order in sync with the column definitions bellow */
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
            unreadOnly={unreadOnly}
            onCreatedAfterChanged={setCreatedAfter}
            onUnreadOnlyChanged={setUnreadOnly}
          />
        ),
      }}
    />
  );
};

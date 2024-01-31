import React, { useMemo } from 'react';
// @ts-ignore Missing types
import RelativeTime from 'react-relative-time';
import { useAsync } from 'react-use';

import {
  Link,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import {
  Box,
  Grid,
  IconButton,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import MarkAsReadIcon from '@material-ui/icons/CheckCircle';
import debounce from 'lodash/debounce';

import { notificationsApiRef, NotificationsQuery } from '../../api';
import { DebounceDelayMs } from '../../constants';
import {
  GetNotificationsCountMessageScopeEnum,
  GetNotificationsOrderByDirecEnum,
  GetNotificationsOrderByEnum,
  Notification,
} from '../../openapi';
import MarkAsUnreadIcon from './MarkAsUnreadIcon';
import {
  CreatedAfterOptions,
  NotificationsFilters,
} from './NotificationsFilters';

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
  messageScope: GetNotificationsCountMessageScopeEnum;
  title: string;
};

export const NotificationsTable = ({
  messageScope,
  title,
}: NotificationsTableProps) => {
  const notificationsApi = useApi(notificationsApiRef);
  const classes = useStyles();
  const [pageNumber, setPageNumber] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(5);
  const [containsText, setContainsText] = React.useState<string>();
  const [createdAfter, setCreatedAfter] = React.useState<string>('lastWeek');
  const [unreadOnly, setUnreadOnly] = React.useState<boolean | undefined>(true);
  const [sorting, setSorting] = React.useState<
    | {
        orderBy: GetNotificationsOrderByEnum;
        orderByDirec: GetNotificationsOrderByDirecEnum;
      }
    | undefined
  >();
  const [reload, setReload] = React.useState(0);

  const onMarkAsReadSwitch = React.useCallback(
    (notification: Notification) => {
      notificationsApi
        .markAsRead({
          messageId: notification.id,
          read: !notification.readByUser,
        })
        .then(() => setReload(Date.now()));
    },
    [notificationsApi],
  );

  const debouncedContainsTextHandler = useMemo(
    () => debounce(setContainsText, DebounceDelayMs),
    [],
  );

  // load data
  const { loading, value, error } = useAsync(async (): Promise<{
    notifications: Notification[];
    totalCount: number;
  }> => {
    const createdAfterDate = CreatedAfterOptions[createdAfter].getDate();

    const commonParams: Pick<
      NotificationsQuery,
      'containsText' | 'createdAfter' | 'messageScope' | 'read'
    > = {
      containsText,
      createdAfter: createdAfterDate,
      messageScope,
    };

    if (unreadOnly !== undefined) {
      commonParams.read = !unreadOnly;
    }

    const data = await notificationsApi.getNotifications({
      ...commonParams,
      ...sorting,
      pageSize,
      pageNumber: pageNumber + 1 /* BE starts at 1 */,
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

  const compactColumns = React.useMemo(
    (): TableColumn<Notification>[] => [
      {
        // Compact content
        render: (notification: Notification) => {
          return (
            <>
              <Box>
                <Typography variant="subtitle2">
                  {notification.title}
                </Typography>
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption">
                  {notification.origin && (
                    <>{notification.origin}&nbsp;&bull;</>
                  )}
                  {notification.topic && <>{notification.topic}&nbsp;&bull;</>}
                  {notification.created && (
                    <>
                      &nbsp; <RelativeTime value={notification.created} />
                    </>
                  )}
                </Typography>
              </Box>
            </>
          );
        },
      },
      {
        // action links
        width: '25%',
        render: (notification: Notification) => {
          return (
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
        },
      },
      {
        // actions
        width: '1rem',
        render: (notification: Notification) => {
          const markAsReadText = notification.readByUser
            ? 'Return among unread'
            : 'Mark as read';
          const IconComponent = notification.readByUser
            ? MarkAsUnreadIcon
            : MarkAsReadIcon;

          return (
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
          );
        },
      },
    ],
    [classes.readActionIcon, onMarkAsReadSwitch],
  );

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <>
      <Grid container>
        <Grid item xs={2}>
          <NotificationsFilters
            createdAfter={createdAfter}
            unreadOnly={unreadOnly}
            onCreatedAfterChanged={setCreatedAfter}
            onUnreadOnlyChanged={setUnreadOnly}
            setSorting={setSorting}
            sorting={sorting}
          />
        </Grid>
        <Grid item xs={10}>
          <Table<Notification>
            title={title}
            isLoading={loading}
            options={{
              search: true,
              paging: true,
              pageSize,
              header: false,
              sorting: false,
            }}
            onPageChange={setPageNumber}
            onRowsPerPageChange={setPageSize}
            page={pageNumber}
            totalCount={value?.totalCount}
            onSearchChange={debouncedContainsTextHandler}
            data={value?.notifications || []}
            columns={compactColumns}
          />
        </Grid>
      </Grid>
    </>
  );
};

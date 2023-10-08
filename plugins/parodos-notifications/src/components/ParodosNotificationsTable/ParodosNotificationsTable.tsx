import React from 'react';

import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Button } from '@material-ui/core';

import { Notification, notificationsApiRef } from '../../api';

// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles({
//   avatar: {
//     height: 32,
//     width: 32,
//     borderRadius: '50%',
//   },
// });

type DenseTableProps = {
  notifications: Notification[];
};

export const DenseTable = ({ notifications }: DenseTableProps) => {
  // const classes = useStyles();

  const columns: TableColumn[] = [
    { title: 'ID', field: 'metadata.uuid' },
    { title: 'Title', field: 'spec.title' },
    { title: 'Message', field: 'spec.message' },
    {
      title: 'Actions',
      render: (row: unknown): React.ReactNode => {
        const data = row as Notification;
        return (
          <>
            <Button
              variant="outlined"
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log('-- TODO: markAsRead: ', data.metadata.uuid);
              }}
            >
              Mark as read
            </Button>
          </>
        );
      },
    },
  ];

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

export const ParodosNotificationsTable = () => {
  const notificationsApi = useApi(notificationsApiRef);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | undefined>(undefined);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    const subscription = notificationsApi
      .getNotifications(/* params */)
      .subscribe({
        next: (notification: Notification) => {
          setIsLoading(false);
          setNotifications(prevState => {
            const newState = [...prevState];
            const oldIndex = prevState.findIndex(
              n => n.metadata.uuid === notification.metadata.uuid,
            );
            if (oldIndex >= 0) {
              newState[oldIndex] = notification;
            } else {
              newState.push(notification);
            }
            return newState;
          });
        },
        error: (err: any) => setError(err),
        complete: () => {
          // eslint-disable-next-line no-console
          console.log('----- Complete ');
        },
      });

    return () => subscription.unsubscribe();
  }, [notificationsApi]);

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (isLoading) {
    return <Progress />;
  }

  return <DenseTable notifications={notifications} />;
};

import React from 'react';
import useAsync from 'react-use/lib/useAsync';

import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import { listNotifications } from '../../notificationsService';
import { Notification } from '../../types';

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
    { title: 'ID', field: 'id' },
    { title: 'Subject', field: 'subject' },
    { title: 'Message', field: 'body' },
  ];

  const data = notifications.map(notification => {
    return {
      ...notification,
    };
  });

  return (
    <Table
      title="Notifications"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

export const ParodosNotificationsTable = () => {
  const config = useApi(configApiRef);
  const backendUrl = config.getString('backend.baseUrl');

  const { value, loading, error } = useAsync(
    async (): Promise<Notification[]> => listNotifications(backendUrl),
    [backendUrl],
  );

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable notifications={value || []} />;
};

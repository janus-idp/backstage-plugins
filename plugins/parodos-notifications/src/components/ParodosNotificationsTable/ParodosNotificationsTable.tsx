import React from 'react';
import useAsync from 'react-use/lib/useAsync';

import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';

import { makeStyles } from '@material-ui/core/styles';

export const exampleData = {
  results: [
    {
      id: 1,
      subject: 'my first message',
      body: 'I have nothing to talk about',
    },
    {
      id: 2,
      subject: 'my second message',
      body: 'I still dont have anything to talk about',
    },
  ],
};

// const useStyles = makeStyles({
//   avatar: {
//     height: 32,
//     width: 32,
//     borderRadius: '50%',
//   },
// });

type Notification = {
  id: string | number;
  subject: string;
  body: string;
};

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
      title="Parodos Notifications"
      options={{ search: false, paging: false }}
      columns={columns}
      data={data}
    />
  );
};

export const ParodosNotificationsTable = () => {
  const { value, loading, error } = useAsync(async (): Promise<
    Notification[]
  > => {
    // Would use fetch in a real world example
    return exampleData.results;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <DenseTable notifications={value || []} />;
};

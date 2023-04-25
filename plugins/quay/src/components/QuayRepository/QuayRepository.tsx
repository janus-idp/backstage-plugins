import React from 'react';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './tableHeading';
import { useRepository, useTags } from '../../hooks';

type QuayRepositoryProps = Record<never, any>;

export function QuayRepository(_props: QuayRepositoryProps) {
  const { repository, organization } = useRepository();
  const classes = useStyles();
  const title = `Quay repository: ${organization}/${repository}`;
  const { loading, data } = useTags(organization, repository);

  if (loading) {
    return <Progress />;
  }

  return (
    <div style={{ border: '1px solid #ddd' }}>
      <Table
        title={title}
        options={{ paging: true, padding: 'dense' }}
        data={data}
        columns={columns}
        emptyContent={
          <div className={classes.empty}>
            No data was added yet,&nbsp;
            <Link to="https://backstage.io/">learn how to add data</Link>.
          </div>
        }
      />
    </div>
  );
}

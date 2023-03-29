import React from 'react';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './tableHeading';
import { useTags } from '../../hooks';

export function QuayRepository(props: RepositoryProps) {
  const classes = useStyles();
  const title = `Quay repository: ${props.organization}/${props.repository}`;
  const { loading, data } = useTags(props.organization, props.repository);

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

QuayRepository.defaultProps = {
  title: 'Docker Images',
};
interface RepositoryProps {
  widget: boolean;
  organization: string;
  repository: string;
  title: string;
}

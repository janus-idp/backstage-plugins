import React from 'react';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './tableHeading';
import { useAllImageStreams } from '../../hooks';
import { Wrapper } from '../Wrapper';

const OcrPageContent = () => {
  const classes = useStyles();

  // const { loading, data } = useAllImageStreams();
  const { loading, data } = {
    loading: false,
    data: [
      {
        name: 'backstage-showcase',
        tags: ['latest'],
        last_modified: '2022-12-02T14:33:18Z',
      },
    ],
  };

  if (loading) {
    return <Progress />;
  }

  return (
      <div style={{ border: '1px solid #ddd' }}>
        <Table
          title="Images"
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


export const OcrPage = () => (
  <Wrapper>
    <OcrPageContent />
  </Wrapper>
)

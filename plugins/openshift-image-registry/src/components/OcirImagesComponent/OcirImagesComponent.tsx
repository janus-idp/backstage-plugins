/* eslint-disable no-console */
import * as React from 'react';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './TableHeading';
import { useAllImageStreams } from '../../hooks/useAllImageStreams';

export const OcirImagesComponent = () => {
  const classes = useStyles();
  const { loading: loadingImgSt, imageStreamsData } = useAllImageStreams();

  // const { loading: loadingNs } = useAsync(async () => {
  //   const res = await client.getNamespaces();
  //   console.log(res, 'namespaces');
  // });

  // const { loading: loadingImgTags } = useAsync(async () => {
  //   const res = imageStreams?.length
  //     ? await client.getImageStreamTags(imageStreams[0])
  //     : undefined;
  //   if (res) console.log(res, 'imagestreamtags');
  // }, [imageStreams]);

  if (loadingImgSt) {
    return <Progress />;
  }

  return (
    <div style={{ border: '1px solid #ddd' }}>
      <Table
        title="Images"
        options={{ paging: true, padding: 'dense' }}
        data={imageStreamsData}
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
};

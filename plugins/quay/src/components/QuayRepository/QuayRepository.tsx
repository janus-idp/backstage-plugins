import { useApi } from '@backstage/core-plugin-api';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './tableHeading';
import { Tag } from '../../types';
import { quayApiRef } from '../../api';
import { formatDate, formatSize } from '../utils';
import { Box, Chip, makeStyles } from '@material-ui/core';

const useLocalStyles = makeStyles({
  chip: {
    margin: 0,
    marginRight: '.2em',
    height: '1.5em',
    '& > span': {
      padding: '.3em',
    },
  },
});

export function QuayRepository(props: RepositoryProps) {
  const quayClient = useApi(quayApiRef);
  const classes = useStyles();
  const localClasses = useLocalStyles();
  const [tags, setTags] = useState<Tag[]>([]);
  const title = `Quay repository: ${props.organization}/${props.repository}`;

  const { loading } = useAsync(async () => {
    const tagsResponse = await quayClient.getTags(
      props.organization,
      props.repository,
    );
    if (tagsResponse.page === 1) {
      setTags(tagsResponse.tags);
    } else {
      setTags(currentTags => [...currentTags, ...tagsResponse.tags]);
    }
    return tagsResponse;
  });

  if (loading) {
    return <Progress />;
  }

  const data = tags?.map((tag: Tag) => {
    const hashFunc = tag.manifest_digest.substring(0, 6);
    const shortHash = tag.manifest_digest.substring(7, 19);
    return {
      name: tag.name,
      last_modified: formatDate(tag.last_modified),
      size: formatSize(tag.size),
      manifest_digest: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip label={hashFunc} className={localClasses.chip} />
          {shortHash}
        </Box>
      ),
      expiration: tag.expiration,
      // is_manifest_list: tag.is_manifest_list,
      // reversion: tag.reversion,
      // start_ts: tag.start_ts,
      // end_ts: tag.end_ts,
      // manifest_list: tag.manifest_list,
    };
  });

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

import { useApi } from '@backstage/core-plugin-api';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { Link, Progress, Table } from '@backstage/core-components';
import { columns, useStyles } from './tableHeading';
import { Tag } from '../../types';
import { AzureContainerRegistryApiRef } from '../../api';
import { formatDate } from '../utils';
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

export function AzureContainerRegistry(props: RepositoryProps) {
  const AzureContainerRegistryClient = useApi(AzureContainerRegistryApiRef);
  const classes = useStyles();
  const localClasses = useLocalStyles();
  const [tags, setTags] = useState<Tag[]>([]);
  const title = `Azure Container Registry Repository: ${props.image}`;

  const { loading } = useAsync(async () => {
    const tagsResponse = await AzureContainerRegistryClient.getTags(props.image);

    setTags(tagsResponse.tags);

    return tagsResponse;
  });

  if (loading) {
    return <Progress />;
  }

  const data = tags?.map((tag: Tag) => {
    const shortHash = tag.digest.substring(0, 12);
    return {
      name: tag.name,
      createdTime: formatDate(tag.createdTime),
      lastModified: formatDate(tag.lastUpdateTime),
      manifest_digest: (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip label="sha256" className={localClasses.chip} />
          {shortHash}
        </Box>
      )
    };
  });

  return (
    <div style={{ border: '1px solid #ddd' }}>
      <Table
        title={title}
        options={{ paging: false, padding: 'dense' }}
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

AzureContainerRegistry.defaultProps = {
  title: 'Docker Images',
};
interface RepositoryProps {
  widget: boolean;
  image: string;
  title: string;
}

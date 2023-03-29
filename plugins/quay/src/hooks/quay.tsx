import { useApi } from '@backstage/core-plugin-api';
import { Box, Chip, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { quayApiRef } from '../api';
import { formatDate, formatSize } from '../components/utils';
import { Tag } from '../types';

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

export const useTags = (organization: string, repository: string) => {
  const quayClient = useApi(quayApiRef);
  const [tags, setTags] = useState<Tag[]>([]);
  const localClasses = useLocalStyles();
  const { loading } = useAsync(async () => {
    const tagsResponse = await quayClient.getTags(organization, repository);
    if (tagsResponse.page === 1) {
      setTags(tagsResponse.tags);
    } else {
      setTags(currentTags => [...currentTags, ...tagsResponse.tags]);
    }
    return tagsResponse;
  });
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

  return { loading, data };
};

import { useApi } from '@backstage/core-plugin-api';
import * as React from 'react';
import { useAsync } from 'react-use';
import { openshiftImageRegistryApiRef } from '../api';
import { formatDate } from '../utils';

export const useAllImageStreams = () => {
  const client = useApi(openshiftImageRegistryApiRef);
  const [imageStreams, setImageStreams] = React.useState([]);

  const { loading } = useAsync(async () => {
    const imgSts = await client.getImageStreams('div');
    setImageStreams(imgSts);
  });

  const imageStreamsData = React.useMemo(() => {
    if (imageStreams?.length) {
      return imageStreams.map((imgSt: any) => ({
        name: imgSt.metadata.name,
        last_modified: formatDate(imgSt.status.tags[0].items[0].created),
        tags: imgSt.status.tags.map((tag: any) => tag.tag),
      }));
    }
    return [];
  }, [imageStreams]);

  return { loading, imageStreamsData };
};

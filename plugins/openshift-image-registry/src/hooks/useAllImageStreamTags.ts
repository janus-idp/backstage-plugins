import * as React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { openshiftImageRegistryApiRef } from '../api';
import { formatDate, formatSize } from '../utils';

export const useAllImageStreamTags = (namespace: string, image: string) => {
  const client = useApi(openshiftImageRegistryApiRef);
  const [imageStreamTags, setImageStreamTags] = React.useState([]);

  const { loading } = useAsync(async () => {
    const imgTags = await client.getImageStreamTags(namespace, image);
    setImageStreamTags(imgTags);
  }, [namespace, image]);

  const imageStreamTagsData = React.useMemo(() => {
    if (imageStreamTags?.length) {
      return imageStreamTags.map((imgTag: any) => ({
        name: imgTag.metadata.name.split(':')[1],
        last_modified: formatDate(imgTag.image?.metadata?.creationTimestamp),
        size: formatSize(imgTag.image?.dockerImageMetadata?.Size),
        manifest_digest: imgTag.image?.metadata?.name,
      }));
    }
    return [];
  }, [imageStreamTags]);

  return { loading, imageStreamTagsData };
};

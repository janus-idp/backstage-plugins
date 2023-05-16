import { useState, useMemo } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { openshiftImageRegistryApiRef } from '../api';
import { formatDate } from '../utils';
import { ImageStream } from '../types';

export const useAllNsImageStreams = () => {
  const client = useApi(openshiftImageRegistryApiRef);
  const [imageStreams, setImageStreams] = useState<any[]>([]);

  const { loading } = useAsync(async () => {
    const imgSts = (await client.getAllImageStreams()) ?? [];
    setImageStreams(imgSts);
  });

  const imageStreamsData: ImageStream[] = useMemo(() => {
    if (imageStreams?.length) {
      return imageStreams.map((imgSt: any) => ({
        uid: imgSt.metadata.uid,
        name: imgSt.metadata.name,
        namespace: imgSt.metadata.namespace,
        last_modified: imgSt.status?.tags?.[0]?.items?.[0]?.created
          ? formatDate(imgSt.status.tags[0].items[0].created)
          : '',
        tags: imgSt.status?.tags?.map((t: any) => t.tag) ?? [],
        dockerImageRepo: imgSt.status?.dockerImageRepository ?? '',
      }));
    }
    return [];
  }, [imageStreams]);

  return { loading, imageStreams: imageStreamsData };
};

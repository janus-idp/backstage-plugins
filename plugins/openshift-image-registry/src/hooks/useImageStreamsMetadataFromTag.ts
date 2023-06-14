import { useState } from 'react';
import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { openshiftImageRegistryApiRef } from '../api';
import { ImageStream, ImageStreamMetadata } from '../types';
import { formatSize } from '../utils';

export const useImageStreamsMetadataFromTag = (imageStreams: ImageStream[]) => {
  const client = useApi(openshiftImageRegistryApiRef);
  const [imageStreamsData, setImageStreamsData] = useState<
    ImageStreamMetadata[]
  >([]);

  const { loading } = useAsync(async () => {
    const imgStsData = imageStreams?.length
      ? await Promise.all(
          imageStreams.map(async (imst: ImageStream) => {
            try {
              const tag = await client.getImageStreamTag(
                imst.namespace,
                imst.name,
                imst.tags[0] || '',
              );
              return {
                ...imst,
                description:
                  tag.image.dockerImageMetadata?.Config?.Labels?.[
                    'io.k8s.description'
                  ] ||
                  tag.image.dockerImageMetadata?.Config?.description ||
                  '',
                version:
                  tag.image.dockerImageMetadata?.Config?.Labels?.version || '',
                size: formatSize(tag.image.dockerImageMetadata?.Size) || '',
              };
            } catch {
              return imst;
            }
          }),
        )
      : [];
    setImageStreamsData(imgStsData);
  }, [imageStreams]);

  return { loading, imageStreamsMetadata: imageStreamsData };
};

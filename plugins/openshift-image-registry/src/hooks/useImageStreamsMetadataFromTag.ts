import { useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { openshiftImageRegistryApiRef } from '../api';
import { formatSize } from '../utils';
import { ImageStream, ImageStreamMetadata } from '../types';

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

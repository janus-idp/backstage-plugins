import React from 'react';

import { EmptyState, Progress } from '@backstage/core-components';

import { useAllNsImageStreams } from '../../hooks/useAllNsImageStreams';
import { useImageStreamsMetadataFromTag } from '../../hooks/useImageStreamsMetadataFromTag';
import { OcirImagesCards } from './OcirImagesCards';

export const OcirImagesView = () => {
  const { loading: imageStreamsLoading, imageStreams } = useAllNsImageStreams();

  const { loading: metadataLoading, imageStreamsMetadata } =
    useImageStreamsMetadataFromTag(imageStreams);

  if (imageStreamsLoading || metadataLoading) {
    return <Progress />;
  }

  return imageStreamsMetadata?.length ? (
    <OcirImagesCards imageStreams={imageStreamsMetadata} />
  ) : (
    <div style={{ width: '100%', height: '100vh' }}>
      <EmptyState missing="content" title="No ImageStreams found" />
    </div>
  );
};

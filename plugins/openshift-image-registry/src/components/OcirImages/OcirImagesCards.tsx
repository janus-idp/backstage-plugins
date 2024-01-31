import React from 'react';

import { EmptyState, ItemCardGrid } from '@backstage/core-components';

import { ImageStreamMetadata } from '../../types';
import { OcirImagesCard } from './OcirImagesCard';
import { OcirImageSearchBar } from './OcirImageSearchBar';
import { OcirImageSidebar } from './OcirImageSidebar';

type OcirImagesCardsProps = {
  imageStreams: ImageStreamMetadata[];
};

export const OcirImagesCards = ({ imageStreams }: OcirImagesCardsProps) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [activeImageStream, setActiveImageStream] =
    React.useState<ImageStreamMetadata>();
  const [filteredImageStreams, setFilteredImageStreams] = React.useState<
    ImageStreamMetadata[] | undefined
  >();

  const imageStreamsList = filteredImageStreams ?? imageStreams;

  const handleImageStreamSelected = React.useCallback(imageStream => {
    setActiveImageStream(imageStream);
    setIsOpen(true);
  }, []);
  const handleClose = React.useCallback(() => setIsOpen(false), [setIsOpen]);

  return (
    <>
      <OcirImageSearchBar
        imageStreams={imageStreams}
        setImageStreams={setFilteredImageStreams}
      />
      {imageStreamsList?.length ? (
        <>
          <ItemCardGrid>
            {imageStreamsList.map((imageStream: ImageStreamMetadata) => (
              <OcirImagesCard
                key={imageStream.uid}
                imageStream={imageStream}
                onImageStreamSelected={handleImageStreamSelected}
              />
            ))}
          </ItemCardGrid>
          {activeImageStream && (
            <OcirImageSidebar
              open={isOpen}
              onClose={handleClose}
              imageStream={activeImageStream}
            />
          )}
        </>
      ) : (
        <div style={{ width: '100%', height: '100vh' }}>
          <EmptyState missing="content" title="No ImageStreams found" />
        </div>
      )}
    </>
  );
};

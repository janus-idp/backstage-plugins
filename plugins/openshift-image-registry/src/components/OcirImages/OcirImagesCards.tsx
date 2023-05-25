import React from 'react';
import { EmptyState, ItemCardGrid } from '@backstage/core-components';
import { OcirImageSidebar } from './OcirImageSidebar';
import { OcirImageSearchBar } from './OcirImageSearchBar';
import { OcirImagesCard } from './OcirImagesCard';
import { ImageStreamMetadata } from '../../types';

type OcirImagesCardsProps = {
  imageStreams: ImageStreamMetadata[];
};

export const OcirImagesCards = ({ imageStreams }: OcirImagesCardsProps) => {
  const [isOpen, toggleDrawer] = React.useState<boolean>(false);
  const [activeImageStream, setActiveImageStream] =
    React.useState<ImageStreamMetadata>();
  const [filteredImageStreams, setFilteredImageStreams] = React.useState<
    ImageStreamMetadata[] | undefined
  >();

  const imageStreamsList = filteredImageStreams || imageStreams;

  const handleOpen = React.useCallback(imageStream => {
    setActiveImageStream(imageStream);
    toggleDrawer(true);
  }, []);

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
                openSidebar={handleOpen}
              />
            ))}
          </ItemCardGrid>
          {activeImageStream && (
            <OcirImageSidebar
              isOpen={isOpen}
              toggleDrawer={toggleDrawer}
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

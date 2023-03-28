import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { ArtifactoryRepository } from '../ArtifactoryRepository';
import { useArtifactoryAppData } from '../useArtifactoryAppData';

export const ArtifactoryDashboardPage = () => {
  const { entity } = useEntity();
  const { imageName } = useArtifactoryAppData({ entity });

  return <ArtifactoryRepository image={imageName} widget={false} />;
};

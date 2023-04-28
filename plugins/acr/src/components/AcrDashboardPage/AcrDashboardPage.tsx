import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';
import { AzureContainerRegistry } from '../AzureContainerRegistry';
import { useAcrAppData } from '../useAcrAppData';

export const AcrDashboardPage = () => {
  const { entity } = useEntity();
  const { imageName } = useAcrAppData({ entity });


  return <AzureContainerRegistry image={imageName} widget={false} />;
};

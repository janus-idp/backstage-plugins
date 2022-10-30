import React from 'react';

import { useCluster } from '../ClusterContext';
import { TableCardFromData } from '../TableCardFromData';

export const ClusterAllocatableResourceCard = (): any => {
  const { data, loading, error } = useCluster();

  if (!('allocatableResources' in data) || error || loading) {
    return null;
  }

  const nameMap = new Map<string, string>([
    ['cpuCores', 'CPU cores'],
    ['memorySize', 'Memory size'],
    ['numberOfPods', 'Number of pods'],
  ]);

  return (
    <TableCardFromData
      data={data.allocatableResources}
      title="Allocatable"
      nameMap={nameMap}
    />
  );
};

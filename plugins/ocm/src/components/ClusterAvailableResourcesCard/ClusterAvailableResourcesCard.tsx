import React from 'react';

import { RequirePermission } from '@backstage/plugin-permission-react';

import { ocmEntityReadPermission } from '@janus-idp/backstage-plugin-ocm-common';

import { useCluster } from '../ClusterContext';
import { TableCardFromData } from '../TableCardFromData';

export const ClusterAvailableResourceCard = (): any => {
  const { data } = useCluster();

  if (!data) {
    return null;
  }

  if (!('availableResources' in data!)) {
    return null;
  }

  const nameMap = new Map<string, string>([
    ['cpuCores', 'CPU cores'],
    ['memorySize', 'Memory size'],
    ['numberOfPods', 'Number of pods'],
  ]);
  return (
    <RequirePermission permission={ocmEntityReadPermission}>
      <TableCardFromData
        data={data.availableResources}
        title="Available"
        nameMap={nameMap}
      />
    </RequirePermission>
  );
};

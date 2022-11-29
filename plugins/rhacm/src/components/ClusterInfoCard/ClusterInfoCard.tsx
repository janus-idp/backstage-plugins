import React from 'react';

import { useCluster } from '../ClusterContext';
import { TableCardFromData } from '../TableCardFromData';

export const ClusterInfoCard = () => {
  const { data } = useCluster();

  if (!data) {
    return null;
  }

  const nameMap = new Map<string, string>([
    ['name', 'Name'],
    ['kubernetesVersion', 'Kubernetes version'],
    ['openshiftId', 'OpenShift ID'],
    ['openshiftVersion', 'OpenShift version'],
    ['platform', 'Platform'],
    ['region', 'Region'],
    ['consoleUrl', 'Console URL'],
    ['oauthUrl', 'OAuth URL'],
  ]);
  return (
    <TableCardFromData data={data} title="Cluster Info" nameMap={nameMap} />
  );
};

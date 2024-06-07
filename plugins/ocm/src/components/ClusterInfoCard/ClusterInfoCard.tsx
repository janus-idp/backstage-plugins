import React from 'react';

import { RequirePermission } from '@backstage/plugin-permission-react';

import { ocmEntityReadPermission } from '@janus-idp/backstage-plugin-ocm-common';

import { useCluster } from '../ClusterContext';
import { Status, Update } from '../common';
import { TableCardFromData } from '../TableCardFromData';

export const ClusterInfoCard = () => {
  const { data } = useCluster();

  if (!data) {
    return null;
  }

  data.openshiftVersion = (
    <Update data={{ version: data.openshiftVersion!, update: data.update! }} />
  ) as any;
  data.status = (<Status status={data.status} />) as any;
  const nameMap = new Map<string, string>([
    ['name', 'Name'],
    ['status', 'Status'],
    ['kubernetesVersion', 'Kubernetes version'],
    ['openshiftId', 'OpenShift ID'],
    ['openshiftVersion', 'OpenShift version'],
    ['platform', 'Platform'],
  ]);
  return (
    <RequirePermission permission={ocmEntityReadPermission}>
      <TableCardFromData data={data} title="Cluster Info" nameMap={nameMap} />
    </RequirePermission>
  );
};

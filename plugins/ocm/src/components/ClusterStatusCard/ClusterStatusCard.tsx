import React from 'react';
import { Typography } from '@material-ui/core';
import {
  InfoCard,
  StatusAborted,
  StatusError,
  StatusOK,
} from '@backstage/core-components';

import { useCluster } from '../ClusterContext';
import { Cluster } from '@janus-idp/backstage-plugin-ocm-common';

const getStatusElement = (data: any) => {
  if (!data) {
    return <StatusAborted />;
  } else if (data.status.available) {
    return <StatusOK />;
  }
  // Cluster is down
  return <StatusError />;
};

export const ClusterStatusCard = (): any => {
  const { data, loading, error } = useCluster();

  return (
    <InfoCard title="Status" divider={false}>
      <div style={{ textAlign: 'center', margin: 0 }}>
        <Typography variant="h1">{getStatusElement(data)}</Typography>
        <Typography variant="subtitle1">
          {loading
            ? 'Loading'
            : (data as Cluster)?.status?.reason || error?.message}
        </Typography>
      </div>
    </InfoCard>
  );
};

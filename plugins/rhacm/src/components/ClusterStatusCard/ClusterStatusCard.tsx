/* eslint-disable no-nested-ternary */
import React from 'react';
import { Typography } from '@material-ui/core';
import {
  InfoCard,
  StatusAborted,
  StatusError,
  StatusOK,
} from '@backstage/core-components';

import { useCluster } from '../ClusterContext';

export const ClusterStatusCard = (): any => {
  const { data, loading, error } = useCluster();
  let reason = data.status.reason;

  if (error) {
    data.status.reason = 'Unavailable';
  } else if (loading) {
    /*
    Can't do data.status.reason = 'Loading' since the value
    will not be overwritten by the state update of the cluster (dunno why)
    */
    reason = 'Loading';
  }

  const down =
    data.status.available && data.status.reason === 'Cluster is down';

  return (
    <InfoCard title="Status" divider={false}>
      <div style={{ textAlign: 'center', margin: 0 }}>
        <Typography variant="h1">
          {data.status.available ? (
            <StatusOK />
          ) : down ? (
            <StatusError />
          ) : (
            <StatusAborted />
          )}
        </Typography>
        <Typography variant="subtitle1">{reason}</Typography>
      </div>
    </InfoCard>
  );
};

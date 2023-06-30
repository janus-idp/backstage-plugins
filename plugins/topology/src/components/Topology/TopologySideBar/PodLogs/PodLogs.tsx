import React from 'react';

import { DismissableBanner, LogViewer } from '@backstage/core-components';

import { Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { usePodLogs } from '../../../../hooks/usePodLogs';
import { ContainerScope } from './types';

type PodLogsProps = {
  podScope: ContainerScope;
};

export const PodLogs = ({ podScope }: PodLogsProps) => {
  const { value, error, loading } = usePodLogs({
    podScope: podScope,
  });

  return (
    <>
      {error && (
        <DismissableBanner
          {...{
            message: error.message,
            variant: 'error',
            fixed: false,
          }}
          id="pod-logs"
        />
      )}
      <Paper
        elevation={1}
        style={{ height: '100%', width: '100%', minHeight: '30rem' }}
      >
        {loading && (
          <Skeleton
            data-testid="logs-skeleton"
            variant="rect"
            width="100%"
            height="100%"
          />
        )}
        {!loading && value !== undefined && <LogViewer text={value.text} />}
      </Paper>
    </>
  );
};

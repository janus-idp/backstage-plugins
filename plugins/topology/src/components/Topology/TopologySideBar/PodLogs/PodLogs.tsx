import React from 'react';

import { DismissableBanner, LogViewer } from '@backstage/core-components';

import { Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { usePodLogs } from '../../../../hooks/usePodLogs';
import { ContainerScope } from './types';

type PodLogsProps = {
  podScope: ContainerScope;
  setLogText: React.Dispatch<React.SetStateAction<string>>;
};

export const PodLogs = ({ podScope, setLogText }: PodLogsProps) => {
  const { value, error, loading } = usePodLogs({
    podScope: podScope,
  });

  React.useEffect(() => {
    if (!loading && value !== undefined) setLogText(value.text);
  }, [loading, setLogText, value]);

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

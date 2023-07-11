import React from 'react';

import { DismissableBanner, LogViewer } from '@backstage/core-components';

import { V1Container, V1Pod } from '@kubernetes/client-node';
import { Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import { usePodLogsOfPipelineRun } from '../../hooks/usePodLogsOfPipelineRun';

type PipelineRunLogViewerProps = { pod: V1Pod };

export const PipelineRunLogViewer = ({ pod }: PipelineRunLogViewerProps) => {
  const { value, error, loading } = usePodLogsOfPipelineRun({
    pod,
  });

  const containersList = pod?.spec?.containers || [];
  let text = '';

  text = containersList.reduce(
    (acc: string, container: V1Container, idx: number) => {
      if (container?.name && value?.[idx]?.text) {
        return acc
          .concat(`${container.name.toUpperCase()}\n${value[idx].text}`)
          .concat(idx === containersList.length - 1 ? '' : '\n');
      }
      return acc;
    },
    '',
  );

  return (
    <>
      {error && (
        <DismissableBanner
          message={error?.message}
          variant="error"
          fixed={false}
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
        {pod && !loading && <LogViewer text={text || 'No Logs found'} />}
      </Paper>
    </>
  );
};

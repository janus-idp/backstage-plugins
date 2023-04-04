import React from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import { useLatestPipelineRun } from '../../hooks/useLatestPipelineRun';
import { PipelineVisualization } from './PipelineVisualization';

export const LatestPipelineRunVisualization = () => {
  const [pipelineResources, loaded] = useLatestPipelineRun();

  if (!loaded) {
    return <Progress />;
  }
  return (
    <InfoCard title="Latest Pipeline Run">
      <PipelineVisualization
        pipelineRun={pipelineResources.pipelineRun}
        taskRuns={pipelineResources.taskRuns}
      />
    </InfoCard>
  );
};

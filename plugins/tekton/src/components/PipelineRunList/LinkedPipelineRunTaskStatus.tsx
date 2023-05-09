import React from 'react';
import { PipelineRunKind } from '../../types/pipelineRun';
import { PipelineBars } from '../Charts/PipelineBars';

export interface LinkedPipelineRunTaskStatusProps {
  pipelineRun: PipelineRunKind;
}

const LinkedPipelineRunTaskStatus = ({
  pipelineRun,
}: LinkedPipelineRunTaskStatusProps) => {
  return (
    <PipelineBars key={pipelineRun.metadata?.name} pipelinerun={pipelineRun} />
  );
};

export default LinkedPipelineRunTaskStatus;

import React from 'react';

import { PipelineRunKind } from '../../types/pipelineRun';
import { PipelineBars } from '../Charts/PipelineBars';

export interface LinkedPipelineRunTaskStatusProps {
  pipelineRun: PipelineRunKind;
}

const LinkedPipelineRunTaskStatus = ({
  pipelineRun,
}: LinkedPipelineRunTaskStatusProps) => {
  return pipelineRun?.metadata?.name ? (
    <PipelineBars key={pipelineRun.metadata.name} pipelinerun={pipelineRun} />
  ) : null;
};

export default LinkedPipelineRunTaskStatus;

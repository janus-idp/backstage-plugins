import * as React from 'react';
import { PipelineRunKind } from '../../types/pipelineRun';
import { PipelineBars } from '../Charts/PipelineBars';

export interface LinkedPipelineRunTaskStatusProps {
  pipelineRun: PipelineRunKind;
}

const LinkedPipelineRunTaskStatus: React.FC<
  LinkedPipelineRunTaskStatusProps
> = ({ pipelineRun }) => {
  return (
    <PipelineBars key={pipelineRun.metadata?.name} pipelinerun={pipelineRun} />
  );
};

export default LinkedPipelineRunTaskStatus;

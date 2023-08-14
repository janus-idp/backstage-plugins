import React from 'react';

import { PipelineRunKind } from '@janus-idp/shared-react';

import PipelineBars from '../Charts/PipelineBars';

const PipelineRunTaskStatus = ({
  pipelineRun,
}: {
  pipelineRun: PipelineRunKind;
}) => {
  return pipelineRun?.metadata?.name ? (
    <PipelineBars key={pipelineRun.metadata.name} pipelineRun={pipelineRun} />
  ) : null;
};

export default PipelineRunTaskStatus;

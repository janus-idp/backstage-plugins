import React from 'react';

import { useDarkTheme } from '../../hooks/useDarkTheme';
import { PipelineVisualizationView } from './PipelineVisualizationView';

type PipelineRunVisualizationProps = {
  pipelineRunName?: string;
};

export const PipelineRunVisualization = ({
  pipelineRunName,
}: PipelineRunVisualizationProps) => {
  useDarkTheme();

  return (
    <>
      {pipelineRunName && (
        <PipelineVisualizationView pipelineRun={pipelineRunName} />
      )}
    </>
  );
};

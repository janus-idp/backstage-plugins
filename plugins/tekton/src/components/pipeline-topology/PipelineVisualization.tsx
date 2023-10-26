import React from 'react';

import { PipelineRunKind, TaskRunKind } from '@janus-idp/shared-react';

import { useDarkTheme } from '../../hooks/useDarkTheme';
import { getGraphDataModel } from '../../utils/pipeline-topology-utils';
import { PipelineLayout } from './PipelineLayout';

import './PipelineVisualization.css';

type PipelineVisualizationProps = {
  pipelineRun: PipelineRunKind | null;
  taskRuns: TaskRunKind[];
};

export const PipelineVisualization = ({
  pipelineRun,
  taskRuns,
}: PipelineVisualizationProps) => {
  useDarkTheme();

  const model = getGraphDataModel(pipelineRun ?? undefined, taskRuns ?? []);

  return (
    <>
      {!model || (model.nodes.length === 0 && model.edges.length === 0) ? (
        <div data-testid="pipeline-no-tasks">
          This Pipeline Run has no tasks to visualize
        </div>
      ) : (
        <div
          data-testid="pipelineRun-visualization"
          className="bs-tkn-pipeline-visualization__layout"
        >
          <PipelineLayout model={model} />
        </div>
      )}
    </>
  );
};

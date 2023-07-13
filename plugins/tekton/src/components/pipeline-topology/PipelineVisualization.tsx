import React from 'react';

import { Typography } from '@material-ui/core';
import { Split, SplitItem } from '@patternfly/react-core';

import { useDarkTheme } from '../../hooks/useDarkTheme';
import { PipelineRunModel } from '../../models';
import { PipelineRunKind } from '../../types/pipelineRun';
import { TaskRunKind } from '../../types/taskRun';
import { pipelineRunStatus } from '../../utils/pipeline-filter-reducer';
import { getGraphDataModel } from '../../utils/pipeline-topology-utils';
import { ResourceStatus, Status } from '../common';
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
      {pipelineRun?.metadata?.name && (
        <Split className="bs-tkn-pipeline-visualization__label">
          <SplitItem style={{ marginRight: 'var(--pf-global--spacer--sm)' }}>
            <span
              className="badge"
              style={{ backgroundColor: PipelineRunModel.color }}
            >
              {PipelineRunModel.abbr}
            </span>
          </SplitItem>
          <SplitItem>
            <Typography variant="h6">
              {pipelineRun.metadata.name}
              <ResourceStatus additionalClassNames="hidden-xs">
                <Status status={pipelineRunStatus(pipelineRun) ?? ''} />
              </ResourceStatus>
            </Typography>
          </SplitItem>
        </Split>
      )}
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

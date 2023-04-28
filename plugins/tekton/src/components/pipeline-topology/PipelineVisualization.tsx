import React from 'react';
import { isEmpty } from 'lodash';
import { Split, SplitItem, Alert } from '@patternfly/react-core';
import { Typography } from '@material-ui/core';
import ResourceStatus from '../common/ResourceStatus';
import Status from '../common/Status';
import { pipelineRunStatus } from '../../utils/pipeline-filter-reducer';
import { PipelineLayout } from './PipelineLayout';
import { useDarkTheme } from '../../hooks/useDarkTheme';
import { TaskRunKind } from '../../types/taskRun';
import { PipelineRunKind } from '../../types/pipelineRun';
import { getGraphDataModel } from '../../utils/pipeline-topology-utils';
import { PipelineRunModel } from '../../models';

import './PipelineVisualization.css';

type PipelineVisualizationProps = {
  pipelineRun: PipelineRunKind | null;
  taskRuns: TaskRunKind[];
};

export const PipelineVisualization: React.FC<PipelineVisualizationProps> = ({
  pipelineRun,
  taskRuns,
}) => {
  useDarkTheme();

  if (!pipelineRun || isEmpty(pipelineRun)) {
    return (
      <Alert
        data-testid="no-pipelinerun-alert"
        variant="info"
        isInline
        title="No PipelineRun to visualize."
      />
    );
  }

  const model = getGraphDataModel(pipelineRun, taskRuns);
  if (!model || (model.nodes.length === 0 && model.edges.length === 0)) {
    return (
      <Alert
        data-testid="no-tasks-alert"
        variant="info"
        isInline
        title="This PipelineRun has no tasks to visualize."
      />
    );
  }
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
      <div
        data-testid="pipeline-visualization"
        className="bs-tkn-pipeline-visualization__layout"
      >
        <PipelineLayout model={model} />
      </div>
    </>
  );
};

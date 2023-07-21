import * as React from 'react';

import { random } from 'lodash';

import {
  ComputedStatus,
  getRunStatusColor,
  getTaskStatus,
  HorizontalStackedBars,
  PipelineRunKind,
  TaskRunKind,
  TaskStatusTooltip,
  TaskStatusTypes,
} from '@janus-idp/shared-react';

import './PipelineRunDecoratorTooltip.css';

const PipelineRunDecoratorTooltip = ({
  pipelineRun,
  status,
  taskRuns,
}: {
  pipelineRun: PipelineRunKind | null;
  status: string | null;
  taskRuns: TaskRunKind[];
}) => {
  if (!pipelineRun || !status) {
    return null;
  }
  const taskStatus = getTaskStatus(pipelineRun, taskRuns);

  const pipelineBars = (
    <HorizontalStackedBars
      id={pipelineRun?.metadata?.uid ?? random().toString()}
      height="1em"
      inline
      values={Object.keys(ComputedStatus).map(rStatus => ({
        color: getRunStatusColor(
          ComputedStatus[rStatus as keyof typeof ComputedStatus],
        ).color,
        name: rStatus,
        size: taskStatus[
          ComputedStatus[
            rStatus as keyof typeof ComputedStatus
          ] as keyof TaskStatusTypes
        ],
      }))}
    />
  );

  const breakdownInfo = <TaskStatusTooltip taskStatus={taskStatus} />;

  return (
    <div className="bs-topology-pipelinerun-decorator-tooltip">
      <div className="bs-topology-pipelinerun-decorator-tooltip__title">
        {`Pipeline ${status}`}
      </div>
      <div className="bs-topology-pipelinerun-decorator-tooltip__status-bars-wrapper">
        <div className="bs-topology-pipelinerun-decorator-tooltip__status-bars-title">
          Task status
        </div>
        <div className="bs-topology-pipelinerun-decorator-tooltip__status-bars">
          {pipelineBars}
        </div>
      </div>
      <div className="bs-topology-pipelinerun-decorator-tooltip__status-breakdown">
        {breakdownInfo}
      </div>
    </div>
  );
};

export default PipelineRunDecoratorTooltip;

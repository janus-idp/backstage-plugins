import React from 'react';

import { RunStatus } from '@patternfly/react-topology';
import classNames from 'classnames';

import { Status } from '@janus-idp/shared-react';

import { StepStatus } from '../../types/taskRun';

import './PipelineVisualizationStepList.css';

export type PipelineVisualizationStepListProps = {
  isSpecOverview: boolean;
  taskName: string;
  steps: StepStatus[];
  isFinallyTask?: boolean;
  hideHeader?: boolean;
};

type TooltipColoredStatusIconProps = {
  status: RunStatus;
};

const TooltipColoredStatusIcon = ({
  status,
}: TooltipColoredStatusIconProps) => {
  const icon = <Status status={status} iconOnly />;
  return icon;
};

export const PipelineVisualizationStepList = ({
  isSpecOverview,
  taskName,
  steps,
  isFinallyTask,
  hideHeader,
}: PipelineVisualizationStepListProps) => {
  return (
    <div className="bs-tkn-pipeline-visualization-step-list">
      {!hideHeader && (
        <div className="bs-tkn-pipeline-visualization-step-list__task-name">
          {taskName}
        </div>
      )}
      {isFinallyTask && (
        <div className="bs-tkn-pipeline-visualization-step-list__task-type">
          Finally task
        </div>
      )}
      {steps?.map(({ duration, name, status }) => {
        return (
          <div
            className={classNames(
              'bs-tkn-pipeline-visualization-step-list__step',
              {
                'bs-tkn-pipeline-visualization-step-list__step--task-run':
                  !isSpecOverview,
              },
            )}
            key={name}
          >
            {!isSpecOverview ? (
              <div className="bs-tkn-pipeline-visualization-step-list__icon">
                <TooltipColoredStatusIcon status={status} />
              </div>
            ) : (
              <span className="bs-tkn-pipeline-visualization-step-list__bullet">
                &bull;
              </span>
            )}
            <div className="bs-tkn-pipeline-visualization-step-list__name">
              {name}
            </div>
            {!isSpecOverview && (
              <div className="bs-tkn-pipeline-visualization-step-list__duration">
                {duration}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

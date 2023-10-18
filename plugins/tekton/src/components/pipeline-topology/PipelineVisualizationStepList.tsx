import React from 'react';

import { RunStatus } from '@patternfly/react-topology';
import classNames from 'classnames';

import { getRunStatusColor } from '@janus-idp/shared-react';

import { StepStatus } from '../../types/taskRun';
import { Status, StatusProps } from '../common/Status';

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
  const size = 18;
  const sharedProps: StatusProps = {
    status,
    iconOnly: true,
    height: size,
    width: size,
  };

  const icon = <Status {...sharedProps} spin />;

  if (status === RunStatus.Succeeded || status === RunStatus.Failed) {
    // Succeeded and Failed icons have transparent centers shapes - in tooltips, this becomes an undesired black
    // This will simply wrap the icon and place a white backdrop
    return (
      <div style={{ color: getRunStatusColor(status).color }}>
        <svg {...sharedProps}>
          <circle
            className="bs-tkn-pipeline-visualization-step-list__icon-backdrop"
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 1}
          />
          {icon}
        </svg>
      </div>
    );
  }

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

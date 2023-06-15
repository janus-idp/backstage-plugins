import React from 'react';

import { ComputedStatus, TaskStatusTypes } from '../../types';
import { getRunStatusColor } from '../../utils';

import './TaskStatusTooltip.css';

interface TaskStatusToolTipProps {
  taskStatus: TaskStatusTypes;
}

export const TaskStatusTooltip = ({ taskStatus }: TaskStatusToolTipProps) => {
  return (
    <div className="bs-shared-task-status-tooltip">
      {Object.keys(ComputedStatus).map(status => {
        const { message, color } = getRunStatusColor(status);
        return taskStatus[status as keyof TaskStatusTypes] ? (
          <React.Fragment key={status}>
            <div
              className="bs-shared-task-status-tooltip__legend"
              style={{ background: color }}
            />
            <div>
              {status === ComputedStatus.PipelineNotStarted ||
              status === ComputedStatus.FailedToStart
                ? message
                : `${taskStatus[status as keyof TaskStatusTypes]} ${message}`}
            </div>
          </React.Fragment>
        ) : null;
      })}
    </div>
  );
};

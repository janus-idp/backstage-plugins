import React from 'react';

import {
  ComputedStatus,
  getRunStatusColor,
  TaskStatusTypes,
} from '@janus-idp/shared-react';

import './TaskStatusTooltip.css';

interface TaskStatusToolTipProps {
  taskStatus: TaskStatusTypes;
}

const TaskStatusToolTip = ({ taskStatus }: TaskStatusToolTipProps) => {
  return (
    <div className="bs-tkn-task-status-tooltip">
      {Object.keys(ComputedStatus).map(status => {
        const { message, color } = getRunStatusColor(status);
        return taskStatus[status as keyof TaskStatusTypes] ? (
          <React.Fragment key={status}>
            <div
              className="bs-tkn-task-status-tooltip__legend"
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

export default TaskStatusToolTip;

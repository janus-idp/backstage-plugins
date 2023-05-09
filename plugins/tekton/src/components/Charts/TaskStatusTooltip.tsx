import React from 'react';
import { ComputedStatus, TaskStatus } from '../../types/computedStatus';
import { getRunStatusColor } from '../../utils/tekton-status';

import './TaskStatusTooltip.css';

interface TaskStatusToolTipProps {
  taskStatus: TaskStatus;
}

const TaskStatusToolTip: React.FC<TaskStatusToolTipProps> = ({
  taskStatus,
}) => {
  return (
    <div className="bs-tkn-task-status-tooltip">
      {Object.keys(ComputedStatus).map(status => {
        const { message, pftoken } = getRunStatusColor(status);
        return taskStatus[status as keyof TaskStatus] ? (
          <React.Fragment key={status}>
            <div
              className="bs-tkn-task-status-tooltip__legend"
              style={{ background: pftoken.value }}
            />
            <div>
              {status === ComputedStatus.PipelineNotStarted ||
              status === ComputedStatus.FailedToStart
                ? message
                : `${taskStatus[status as keyof TaskStatus]} ${message}`}
            </div>
          </React.Fragment>
        ) : null;
      })}
    </div>
  );
};

export default TaskStatusToolTip;

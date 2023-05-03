import * as React from 'react';
import { Tooltip } from '@patternfly/react-core';
import HorizontalStackedBars from './HorizontalStackedBars';
import TaskStatusToolTip from './TaskStatusTooltip';
import { ComputedStatus, TaskStatus } from '../../types/computedStatus';
import { getRunStatusColor } from '../../utils/tekton-status';
import {
  getTaskRunsForPipelineRun,
  getTaskStatus,
} from '../../utils/tekton-utils';
import { PipelineRunKind } from '../../types/pipelineRun';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';

export interface PipelineBarProps {
  pipelinerun: PipelineRunKind;
}

export const PipelineBars: React.FC<PipelineBarProps> = ({ pipelinerun }) => {
  const { watchResourcesData } = React.useContext(TektonResourcesContext);
  const taskRuns = watchResourcesData?.taskruns?.data || [];
  const plrTasks = getTaskRunsForPipelineRun(pipelinerun, taskRuns);
  const taskStatus = getTaskStatus(pipelinerun, plrTasks);
  return (
    <Tooltip content={<TaskStatusToolTip taskStatus={taskStatus} />}>
      <HorizontalStackedBars
        height="1em"
        inline
        values={Object.keys(ComputedStatus).map(status => ({
          color: getRunStatusColor(
            ComputedStatus[status as keyof typeof ComputedStatus],
          ).pftoken.value,
          name: status,
          size: taskStatus[
            ComputedStatus[
              status as keyof typeof ComputedStatus
            ] as keyof TaskStatus
          ],
        }))}
      />
    </Tooltip>
  );
};

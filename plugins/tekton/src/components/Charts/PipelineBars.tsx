import { Tooltip } from '@patternfly/react-core';
import React from 'react';
import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { ComputedStatus, TaskStatus } from '../../types/computedStatus';
import { PipelineRunKind } from '../../types/pipelineRun';
import { getRunStatusColor } from '../../utils/tekton-status';
import {
  getTaskRunsForPipelineRun,
  getTaskStatus,
} from '../../utils/tekton-utils';
import HorizontalStackedBars from './HorizontalStackedBars';
import TaskStatusToolTip from './TaskStatusTooltip';

export interface PipelineBarProps {
  pipelinerun: PipelineRunKind;
}

export const PipelineBars = ({ pipelinerun }: PipelineBarProps) => {
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

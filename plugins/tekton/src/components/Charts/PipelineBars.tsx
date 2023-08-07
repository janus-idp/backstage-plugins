import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import {
  ComputedStatus,
  getRunStatusColor,
  getTaskRunsForPipelineRun,
  PipelineRunKind,
  TaskStatusTypes,
} from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { getTaskStatusOfPLR } from '../../utils/tekton-utils';
import HorizontalStackedBars from './HorizontalStackedBars';
import TaskStatusToolTip from './TaskStatusTooltip';

export interface PipelineBarProps {
  pipelinerun: PipelineRunKind;
}

export const PipelineBars = ({ pipelinerun }: PipelineBarProps) => {
  const { watchResourcesData } = React.useContext(TektonResourcesContext);
  const taskRuns = watchResourcesData?.taskruns?.data || [];
  const plrTasks = getTaskRunsForPipelineRun(pipelinerun, taskRuns);
  const taskStatus = getTaskStatusOfPLR(pipelinerun, plrTasks);
  return (
    <Tooltip content={<TaskStatusToolTip taskStatus={taskStatus} />}>
      <HorizontalStackedBars
        height="1em"
        inline
        values={Object.keys(ComputedStatus).map(status => ({
          color: getRunStatusColor(
            ComputedStatus[status as keyof typeof ComputedStatus],
          ).color,
          name: status,
          size: taskStatus[
            ComputedStatus[
              status as keyof typeof ComputedStatus
            ] as keyof TaskStatusTypes
          ],
        }))}
      />
    </Tooltip>
  );
};

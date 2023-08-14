import React from 'react';

import { Tooltip } from '@patternfly/react-core';

import {
  ComputedStatus,
  getRunStatusColor,
  getTaskRunsForPipelineRun,
  HorizontalStackedBars,
  PipelineRunKind,
  TaskStatusTooltip,
  TaskStatusTypes,
} from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { getTaskStatusOfPLR } from '../../utils/tekton-utils';
import PipelineRunLogDialog from '../PipelineRunLogs/PipelineRunLogDialog';

type PipelineBarProps = { pipelineRun: PipelineRunKind };

const PipelineBars = ({ pipelineRun }: PipelineBarProps) => {
  const { watchResourcesData } = React.useContext(TektonResourcesContext);
  const [open, setOpen] = React.useState<boolean>(false);
  const pods = watchResourcesData?.pods?.data || [];
  const taskRuns = watchResourcesData?.taskruns?.data || [];
  const plrTasks = getTaskRunsForPipelineRun(pipelineRun, taskRuns);
  const taskStatus = getTaskStatusOfPLR(pipelineRun, plrTasks);

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <PipelineRunLogDialog
        open={open}
        closeDialog={closeDialog}
        pods={pods}
        taskRuns={taskRuns}
        pipelineRun={pipelineRun}
      />
      <Tooltip content={<TaskStatusTooltip taskStatus={taskStatus} />}>
        <HorizontalStackedBars
          id={`${pipelineRun?.metadata?.name}`}
          onClick={openDialog}
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
    </>
  );
};

export default PipelineBars;

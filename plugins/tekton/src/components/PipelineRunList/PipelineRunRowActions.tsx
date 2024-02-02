import * as React from 'react';

import { IconButton } from '@material-ui/core';
import { Flex, FlexItem } from '@patternfly/react-core';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';

import {
  ComputedStatus,
  pipelineRunFilterReducer,
  PipelineRunKind,
  TaskRunKind,
} from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import {
  getTaskrunsOutputGroup,
  hasExternalLink,
  isSbomTaskRun,
} from '../../utils/taskRun-utils';
import OutputIcon from '../Icons/OutputIcon';
import ViewLogsIcon from '../Icons/ViewLogsIcon';
import PipelineRunLogDialog from '../PipelineRunLogs/PipelineRunLogDialog';
import PipelineRunOutputDialog from '../PipelineRunOutput/PipelineRunOutputDialog';
import PipelineRunSBOMLink from './PipelineRunSBOMLink';

const PipelineRunRowActions: React.FC<{ pipelineRun: PipelineRunKind }> = ({
  pipelineRun,
}) => {
  const { watchResourcesData } = React.useContext(TektonResourcesContext);
  const [open, setOpen] = React.useState<boolean>(false);

  const [openOutput, setOpenOutput] = React.useState<boolean>(false);
  const [noActiveTask, setNoActiveTask] = React.useState(false);
  const pods = watchResourcesData?.pods?.data || [];
  const taskRuns = watchResourcesData?.taskruns?.data || [];
  const { sbomTaskRun } = getTaskrunsOutputGroup(
    pipelineRun?.metadata?.name,
    taskRuns,
  );
  const activeTaskName = sbomTaskRun?.metadata?.name;

  const openDialog = (viewLogs?: boolean) => {
    if (viewLogs) setNoActiveTask(true);
    setOpen(true);
  };

  const openOutputDialog = () => {
    setOpenOutput(true);
  };

  const closeDialog = () => {
    setNoActiveTask(false);
    setOpen(false);
  };

  const {
    acsImageScanTaskRun,
    acsImageCheckTaskRun,
    acsDeploymentCheckTaskRun,
    ecTaskRun,
  } = getTaskrunsOutputGroup(pipelineRun?.metadata?.name, taskRuns);

  const finishedTaskruns = [
    ...(acsImageScanTaskRun ? [acsImageScanTaskRun] : []),
    ...(acsImageCheckTaskRun ? [acsImageCheckTaskRun] : []),
    ...(acsDeploymentCheckTaskRun ? [acsDeploymentCheckTaskRun] : []),
    ...(ecTaskRun ? [ecTaskRun] : []),
  ].filter((taskRun: TaskRunKind) =>
    [
      ComputedStatus.Succeeded,
      ComputedStatus.Failed,
      ComputedStatus.Skipped,
    ].includes(pipelineRunFilterReducer(taskRun)),
  );

  const results =
    pipelineRun?.status?.pipelineResults || pipelineRun?.status?.results || [];

  const disabled =
    results.length === 0 ? finishedTaskruns.length === 0 : results.length === 0;

  return (
    <>
      <PipelineRunLogDialog
        pipelineRun={pipelineRun}
        open={open}
        closeDialog={closeDialog}
        pods={pods}
        taskRuns={taskRuns}
        activeTask={noActiveTask ? undefined : activeTaskName}
      />

      <PipelineRunOutputDialog
        pipelineRun={pipelineRun}
        taskRuns={taskRuns}
        open={openOutput}
        closeDialog={() => {
          setOpenOutput(false);
        }}
      />
      <Flex gap={{ default: 'gapXs' }}>
        <FlexItem>
          <Tooltip content="View logs">
            <IconButton size="small" onClick={() => openDialog(true)}>
              <ViewLogsIcon />
            </IconButton>
          </Tooltip>
        </FlexItem>

        <FlexItem align={{ default: 'alignLeft' }}>
          <Tooltip
            content={
              !sbomTaskRun
                ? 'View SBOM is not applicable for this PipelineRun'
                : 'View SBOM'
            }
          >
            <IconButton
              data-testid="view-sbom-icon"
              disabled={!sbomTaskRun || !isSbomTaskRun(sbomTaskRun)}
              size="small"
              onClick={
                !hasExternalLink(sbomTaskRun) ? () => openDialog() : undefined
              }
              style={{ pointerEvents: 'auto', padding: 0 }}
            >
              <PipelineRunSBOMLink sbomTaskRun={sbomTaskRun} />
            </IconButton>
          </Tooltip>
        </FlexItem>
        <FlexItem align={{ default: 'alignLeft' }}>
          <Tooltip
            content={
              disabled
                ? 'View Output is not applicable for this PipelineRun'
                : 'View Output'
            }
          >
            <IconButton
              data-testid="view-output-icon"
              disabled={disabled}
              size="small"
              onClick={() => openOutputDialog()}
              style={{ pointerEvents: 'auto', padding: 0 }}
            >
              <OutputIcon disabled={disabled} />
            </IconButton>
          </Tooltip>
        </FlexItem>
      </Flex>
    </>
  );
};
export default React.memo(PipelineRunRowActions);

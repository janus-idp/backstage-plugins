import * as React from 'react';

import { IconButton } from '@material-ui/core';
import { Flex, FlexItem } from '@patternfly/react-core';
import { Tooltip } from '@patternfly/react-core/dist/esm/components/Tooltip/Tooltip';

import { PipelineRunKind } from '@janus-idp/shared-react';

import { TektonResourcesContext } from '../../hooks/TektonResourcesContext';
import { getSbomTaskRun, isSbomTaskRun } from '../../utils/taskRun-utils';
import ViewLogsIcon from '../Icons/ViewLogsIcon';
import PipelineRunLogDialog from '../PipelineRunLogs/PipelineRunLogDialog';
import PipelineRunSBOMLink from './PipelineRunSBOMLink';

const PipelineRunRowActions: React.FC<{ pipelineRun: PipelineRunKind }> = ({
  pipelineRun,
}) => {
  const { watchResourcesData } = React.useContext(TektonResourcesContext);
  const [open, setOpen] = React.useState<boolean>(false);
  const [noActiveTask, setNoActiveTask] = React.useState(false);
  const pods = watchResourcesData?.pods?.data || [];
  const taskRuns = watchResourcesData?.taskruns?.data || [];
  const sbomTaskRun = getSbomTaskRun(pipelineRun?.metadata?.name, taskRuns);
  const activeTaskName = sbomTaskRun?.metadata?.name;

  const openDialog = (viewLogs?: boolean) => {
    if (viewLogs) setNoActiveTask(true);
    setOpen(true);
  };

  const closeDialog = () => {
    setNoActiveTask(false);
    setOpen(false);
  };

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
              disabled={!sbomTaskRun || !isSbomTaskRun(sbomTaskRun)}
              size="small"
              onClick={() => openDialog()}
              style={{ pointerEvents: 'auto', padding: 0 }}
            >
              <PipelineRunSBOMLink sbomTaskRun={sbomTaskRun} />
            </IconButton>
          </Tooltip>
        </FlexItem>
      </Flex>
    </>
  );
};
export default React.memo(PipelineRunRowActions);

import React from 'react';

import { ErrorBoundary } from '@backstage/core-components';

import { V1Pod } from '@kubernetes/client-node';
import {
  Box,
  createStyles,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Theme,
} from '@material-ui/core';
import { CloseIcon } from '@patternfly/react-icons';

import { PipelineRunKind, TaskRunKind } from '@janus-idp/shared-react';

import { tektonGroupColor } from '../../types/types';
import ResourceBadge from '../PipelineRunList/ResourceBadge';
import PipelineRunLogDownloader from './PipelineRunLogDownloader';
import PipelineRunLogs from './PipelineRunLogs';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }),
);

type PipelineRunLogDialogProps = {
  open: boolean;
  closeDialog: () => void;
  pipelineRun: PipelineRunKind;
  taskRuns: TaskRunKind[];
  pods: V1Pod[];
  activeTask?: string;
};
const PipelineRunLogDialog = ({
  open,
  closeDialog,
  pipelineRun,
  pods,
  taskRuns,
  activeTask,
}: PipelineRunLogDialogProps) => {
  const classes = useStyles();

  const [task, setTask] = React.useState(activeTask);

  return (
    <Dialog
      data-testid="pipelinerun-logs-dialog"
      maxWidth="xl"
      fullWidth
      open={open}
      onClose={closeDialog}
    >
      <DialogTitle id="pipelinerun-logs" title="PipelineRun Logs">
        <Box className={classes.titleContainer}>
          <ResourceBadge
            color={tektonGroupColor}
            abbr="PLR"
            name={pipelineRun?.metadata?.name ?? ''}
          />
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={closeDialog}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <ErrorBoundary>
          <PipelineRunLogDownloader
            pods={pods}
            activeTask={task}
            pipelineRun={pipelineRun}
          />
          <PipelineRunLogs
            pipelineRun={pipelineRun}
            taskRuns={taskRuns}
            pods={pods}
            activeTask={task}
            setActiveTask={setTask}
          />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(PipelineRunLogDialog);

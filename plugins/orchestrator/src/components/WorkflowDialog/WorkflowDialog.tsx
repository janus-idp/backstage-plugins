import React from 'react';

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { WorkflowEditor } from '../WorkflowEditor';
import { WorkflowEditorView } from '../WorkflowEditor/WorkflowEditor';

type OrchestratorWorkflowDialogProps = {
  workflowId: string;
  title: string;
  open: boolean;
  close: () => void;
} & WorkflowEditorView;

const useStyles = makeStyles(_theme => ({
  editor: {
    height: '600px',
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
}));

export const WorkflowDialog = (
  props: OrchestratorWorkflowDialogProps,
): JSX.Element | null => {
  const { workflowId, title, open, close } = props;
  const classes = useStyles();

  return (
    <Dialog fullWidth maxWidth="lg" onClose={_ => close()} open={open}>
      <DialogTitle>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <IconButton
            className={classes.closeBtn}
            aria-label="close"
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box className={classes.editor}>
          <WorkflowEditor {...props} workflowId={workflowId} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

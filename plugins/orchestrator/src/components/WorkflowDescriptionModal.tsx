import React, { forwardRef, ForwardRefRenderFunction } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { WorkflowOverviewDTO } from '@janus-idp/backstage-plugin-orchestrator-common';

export type WorkflowDescriptionModalProps = {
  workflow: WorkflowOverviewDTO;
  workflowError?: {
    itemId: string;
    error: any;
  };
  runWorkflowLink: string;
  open: boolean;
  onClose?: () => void;
};

export type ParentComponentRef = HTMLElement;

const useStyles = makeStyles(_theme => ({
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
}));

export const RefForwardingWorkflowDescriptionModal: ForwardRefRenderFunction<
  ParentComponentRef,
  WorkflowDescriptionModalProps
> = (props, forwardedRef): JSX.Element | null => {
  const {
    workflow,
    open = false,
    onClose,
    runWorkflowLink,
    workflowError,
  } = props;
  const classes = useStyles();
  const navigate = useNavigate();

  const handleRunWorkflow = () => {
    if (runWorkflowLink) {
      navigate(runWorkflowLink);
    }
  };

  let content;
  if (workflowError) {
    content = (
      <Box>
        <p>
          Failed to load details for the workflow ID:
          {workflowError.itemId}
        </p>
        {workflowError.error.message && <p>{workflowError.error.message}</p>}
      </Box>
    );
  } else if (workflow.description) {
    content = <Box>{workflow.description}</Box>;
  } else {
    content = (
      <Box>
        <p>Are you sure you want to run this workflow?</p>
      </Box>
    );
  }

  return (
    <Dialog
      onClose={_ => onClose}
      open={open}
      ref={forwardedRef}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box>
          <Typography variant="h5">{workflow.name}</Typography>
          <IconButton
            className={classes.closeBtn}
            aria-label="close"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>{content}</DialogContent>
      <DialogActions>
        <Button
          onClick={handleRunWorkflow}
          color="primary"
          variant="contained"
          disabled={!!workflowError}
        >
          Run workflow
        </Button>
        <Button onClick={onClose} color="primary" variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const WorkflowDescriptionModal = forwardRef(
  RefForwardingWorkflowDescriptionModal,
);

import React, { forwardRef, ForwardRefRenderFunction } from 'react';

import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

export type InfoDialogProps = {
  title: string;
  open: boolean;
  onClose?: () => void;
  dialogActions?: React.ReactNode;
  children?: React.ReactNode;
};

export type ParentComponentRef = HTMLElement;

const useStyles = makeStyles(_theme => ({
  closeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
  },
}));

export const RefForwardingInfoDialog: ForwardRefRenderFunction<
  ParentComponentRef,
  InfoDialogProps
> = (props, forwardedRef): JSX.Element | null => {
  const { title, open = false, onClose, children, dialogActions } = props;
  const classes = useStyles();

  return (
    <Dialog onClose={_ => onClose} open={open} ref={forwardedRef}>
      <DialogTitle>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <IconButton
            className={classes.closeBtn}
            aria-label="close"
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box>{children}</Box>
      </DialogContent>
      <DialogActions>{dialogActions}</DialogActions>
    </Dialog>
  );
};

export const InfoDialog = forwardRef(RefForwardingInfoDialog);

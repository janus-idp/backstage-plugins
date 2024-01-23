import React, { forwardRef, ForwardRefRenderFunction } from 'react';

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

export type InfoDialogProps = {
  title: string;
  open: boolean;
  close: () => void;
  dialogActions?: React.ReactNode;
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
  const { title, open, close } = props;
  const classes = useStyles();

  return (
    <Dialog onClose={_ => close()} open={open} ref={forwardedRef}>
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
        <Box>{props.children}</Box>
      </DialogContent>
      {props.dialogActions}
    </Dialog>
  );
};

export const InfoDialog = forwardRef(RefForwardingInfoDialog);

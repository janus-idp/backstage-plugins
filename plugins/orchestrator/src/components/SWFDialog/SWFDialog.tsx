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

import { SWFEditor } from '../SWFEditor';
import { SwfEditorView } from '../SWFEditor/SWFEditor';

type SWFDialogProps = {
  swfId: string;
  title: string;
  open: boolean;
  close: () => void;
} & SwfEditorView;

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

export const SWFDialog = (props: SWFDialogProps): JSX.Element | null => {
  const { swfId, title, open, close } = props;
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
          <SWFEditor {...props} swfId={swfId} />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

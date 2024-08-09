import React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { AddRepositoryData } from '../../types/types';

type DeleteRepositoryDialogProps = {
  open: boolean;
  error: string;
  closeDialog: () => void;
  repository: AddRepositoryData;
  removeRepository: () => void;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContainer: {
      height: '70%',
    },

    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    },
    dialogTitle: {
      padding: '16px 20px',
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[700],
    },
    warningIcon: {
      alignContent: 'center',
      marginTop: '7px',
      marginBottom: '-5px',
      color: '#F0AB00',
    },
    button: {
      textTransform: 'none',
    },
    deleteButton: {
      backgroundColor: '#C9190B',
      color: theme.palette.getContrastText(theme.palette.error.main),
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    },
  }),
);

const DeleteRepositoryDialog = ({
  open,
  closeDialog,
  repository,
  removeRepository,
  error,
}: DeleteRepositoryDialogProps) => {
  const classes = useStyles();
  const handleClickRemove = () => {
    removeRepository();
  };
  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={closeDialog}
      className={classes.dialogContainer}
    >
      <DialogTitle
        id="delete-repository"
        title="Delete Repository"
        className={classes.dialogTitle}
      >
        <Box className={classes.titleContainer}>
          <span style={{ fontWeight: 'bold' }}>
            <WarningIcon className={classes.warningIcon} color="warning" />{' '}
            Remove {repository.repoName} repository?
          </span>

          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={closeDialog}
            title="Close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Removing a repository erases all associated information from the
          Catalog page.
        </Typography>
      </DialogContent>
      {error && (
        <Box maxWidth="650px" marginLeft="20px">
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <DialogActions style={{ justifyContent: 'left', padding: '20px' }}>
        <Button
          variant="contained"
          className={`${classes.deleteButton} ${classes.button}`}
          onClick={() => handleClickRemove()}
        >
          Remove
        </Button>
        <Button
          variant="outlined"
          className={classes.button}
          onClick={() => closeDialog()}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteRepositoryDialog;

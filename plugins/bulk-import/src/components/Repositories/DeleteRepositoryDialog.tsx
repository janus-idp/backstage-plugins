import React from 'react';

import {
  Box,
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import WarningIcon from '@mui/icons-material/Warning';

import { AddRepositoriesData } from '../../types';

type DeleteRepositoryDialogProps = {
  open: boolean;
  closeDialog: () => void;
  repository: AddRepositoriesData;
  removeRepository: () => void;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContainer: {
      height: '70%',
    },
    dialogContent: {
      padding: '8px 0',
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
}: DeleteRepositoryDialogProps) => {
  const classes = useStyles();
  const handleClickRemove = () => {
    removeRepository();
    closeDialog();
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
        <DialogContent className={classes.dialogContent}>
          <Typography variant="body1">
            Removing a repository erases all associated information from the
            Catalog page.
          </Typography>
        </DialogContent>
      </DialogTitle>
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

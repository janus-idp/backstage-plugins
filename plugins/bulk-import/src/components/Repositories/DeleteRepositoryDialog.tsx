import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

import { createStyles, makeStyles, Theme } from '@material-ui/core';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { AddRepositoryData } from '../../types';

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
}: {
  open: boolean;
  repository: AddRepositoryData;
  closeDialog: () => void;
}) => {
  const classes = useStyles();
  const bulkImportApi = useApi(bulkImportApiRef);
  const deleteRepository = (deleteRepo: AddRepositoryData) => {
    return bulkImportApi.deleteImportAction(
      deleteRepo.repoUrl || '',
      deleteRepo.defaultBranch || 'main',
    );
  };
  const mutationDelete = useMutation(deleteRepository, {
    onSuccess: () => {
      closeDialog();
    },
  });
  const handleClickRemove = async () => {
    mutationDelete.mutate(repository);
  };

  const isUrlMissing = !repository.repoUrl;

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
      {(isUrlMissing || mutationDelete.isError) && (
        <Box maxWidth="650px" marginLeft="20px">
          <Alert severity="error">
            {isUrlMissing &&
              'Cannot remove repository as the repository URL is missing.'}
            {mutationDelete.isError &&
              `Unable to remove repository. ${mutationDelete.error}`}
          </Alert>
        </Box>
      )}
      <DialogActions style={{ justifyContent: 'left', padding: '20px' }}>
        <Button
          variant="contained"
          className={`${classes.deleteButton} ${classes.button}`}
          onClick={() => handleClickRemove()}
          disabled={
            isUrlMissing || mutationDelete.isLoading || mutationDelete.isError
          }
          startIcon={
            mutationDelete.isLoading && (
              <CircularProgress size="20px" color="inherit" />
            )
          }
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

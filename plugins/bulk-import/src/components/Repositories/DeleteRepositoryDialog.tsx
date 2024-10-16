import React from 'react';

import { useApi } from '@backstage/core-plugin-api';

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
import { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import { get } from 'lodash';

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
  const [error, setError] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const bulkImportApi = useApi(bulkImportApiRef);
  const handleClickRemove = async () => {
    setIsSubmitting(true);
    if (!repository.repoUrl || !repository?.defaultBranch) {
      setIsSubmitting(false);
      setError(
        `Unable to remove repository. ${!repository?.repoUrl ? 'Repository URL missing' : 'Repository default branch is missing'}`,
      );
    } else {
      const value = await bulkImportApi.deleteImportAction(
        repository.repoUrl,
        repository.defaultBranch,
      );
      setIsSubmitting(false);
      if (get(value, 'error')) {
        setError(`Unable to remove repository. ${get(value, 'error.message')}`);
      } else {
        closeDialog();
      }
    }
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
            size="large"
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
          disabled={isSubmitting}
          startIcon={
            isSubmitting && <CircularProgress size="20px" color="inherit" />
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

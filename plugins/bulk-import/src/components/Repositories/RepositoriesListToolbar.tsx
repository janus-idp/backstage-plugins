import React from 'react';

import { LinkButton } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useFormikContext } from 'formik';

import { AddRepositoriesFormValues } from '../../types';

const useStyles = makeStyles(theme => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'end',
    marginBottom: '24px',
  },
  rbacPreReqLink: {
    color: theme.palette.link,
  },
  alertTitle: {
    fontWeight: 'bold',
  },
}));

export const RepositoriesListToolbar = () => {
  const { status, setStatus } = useFormikContext<AddRepositoriesFormValues>();
  const classes = useStyles();

  const handleCloseAlert = () => {
    setStatus(null);
  };
  return (
    <div>
      {(status?.title || status?.url) && (
        <>
          <Alert severity="error" onClose={() => handleCloseAlert()}>
            <AlertTitle>
              Error occured while fetching the pull request
            </AlertTitle>
            {`${status?.title} ${status?.url}`}
          </Alert>
          <br />
        </>
      )}
      <span className={classes.toolbar}>
        <LinkButton
          to="add"
          color="primary"
          variant="contained"
          data-testid="add-repository"
        >
          Add
        </LinkButton>
      </span>
    </div>
  );
};

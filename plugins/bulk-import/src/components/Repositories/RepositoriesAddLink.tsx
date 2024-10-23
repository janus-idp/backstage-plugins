import React from 'react';

import { LinkButton } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useFormikContext } from 'formik';

import { AddRepositoriesFormValues } from '../../types';

const useStyles = makeStyles(() => ({
  addLink: {
    display: 'flex',
    justifyContent: 'end',
    marginBottom: '24px',
  },
}));

export const RepositoriesAddLink = () => {
  const { status, setStatus } = useFormikContext<AddRepositoriesFormValues>();
  const classes = useStyles();

  const handleCloseAlert = () => {
    setStatus(null);
  };
  return (
    <>
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
      <span className={classes.addLink}>
        <LinkButton
          to="add"
          color="primary"
          variant="contained"
          data-testid="add-repository"
        >
          Add
        </LinkButton>
      </span>
    </>
  );
};

import React from 'react';

import { LinkButton } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';

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
  const classes = useStyles();
  return (
    <div>
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

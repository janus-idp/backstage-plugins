import React from 'react';

import { LinkButton } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(_theme => ({
  toolbar: {
    display: 'flex',
    justifyContent: 'end',
    marginBottom: '24px',
  },
}));

export const RolesListToolbar = ({
  createRoleAllowed,
}: {
  createRoleAllowed: boolean;
}) => {
  const classes = useStyles();
  return (
    <span className={classes.toolbar}>
      <LinkButton
        to="role/new"
        color="primary"
        variant="contained"
        disabled={!createRoleAllowed}
        data-testid="create-role"
      >
        Create
      </LinkButton>
    </span>
  );
};

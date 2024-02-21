import React from 'react';

import { LinkButton } from '@backstage/core-components';

import { makeStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

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

export const RolesListToolbar = ({
  createRoleAllowed,
  createRoleLoading,
}: {
  createRoleAllowed: boolean;
  createRoleLoading: boolean;
}) => {
  const classes = useStyles();
  return (
    <div>
      {!createRoleLoading && !createRoleAllowed && (
        <Alert severity="warning" data-testid="create-role-warning">
          <AlertTitle className={classes.alertTitle}>
            Unable to create role.
          </AlertTitle>
          To enable create role button, the role associated with your user
          should have the permission policies mentioned{' '}
          <a
            href="https://github.com/janus-idp/backstage-plugins/tree/main/plugins/rbac#prerequisites"
            target="blank"
            className={classes.rbacPreReqLink}
          >
            here
          </a>{' '}
          associated with it.
        </Alert>
      )}
      <br />
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
    </div>
  );
};

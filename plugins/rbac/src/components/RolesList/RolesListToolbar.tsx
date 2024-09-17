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
          To enable create/edit role button, make sure required users/groups are
          available in catalog as a role cannot be created without users/groups
          and also the role associated with your user should have the permission
          policies mentioned{' '}
          <a
            href="https://github.com/janus-idp/backstage-plugins/tree/main/plugins/rbac#prerequisites"
            target="blank"
            className={classes.rbacPreReqLink}
          >
            here
          </a>
          .
          <br />
          <span>
            <span style={{ fontWeight: 'bold' }}>Note</span>: Even after
            ingesting users/groups in catalog and applying above permissions if
            the create/edit button is still disabled then please contact your
            administrator as you might be conditionally restricted from
            accessing the create/edit button.
          </span>
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

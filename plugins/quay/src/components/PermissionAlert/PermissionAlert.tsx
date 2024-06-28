import React from 'react';

import { Alert, AlertTitle } from '@material-ui/lab';

const PermissionAlert = () => {
  return (
    <Alert severity="warning" data-testid="no-permission-alert">
      <AlertTitle>Permission required</AlertTitle>
      To view quay image registry, contact your administrator to give you the
      quay.view.read and catalog.entity.read permissions.
    </Alert>
  );
};
export default PermissionAlert;

import React from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

export const SnackbarAlert = ({
  toastMessage,
  onAlertClose,
}: {
  toastMessage: string;
  onAlertClose: () => void;
}) => {
  return (
    <Snackbar
      open={toastMessage !== ''}
      autoHideDuration={10000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      style={{ top: '100px', left: '0px', justifyContent: 'center' }}
      onClose={onAlertClose}
    >
      <Alert onClose={onAlertClose} severity="success">
        {toastMessage}
      </Alert>
    </Snackbar>
  );
};

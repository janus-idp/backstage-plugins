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
      autoHideDuration={6000}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ width: '100%' }}
      style={{ top: '100px', right: '20px' }}
      onClose={onAlertClose}
    >
      <Alert
        onClose={onAlertClose}
        severity="info"
        variant="filled"
        icon={false}
        sx={{ width: '60%' }}
      >
        {toastMessage}
      </Alert>
    </Snackbar>
  );
};

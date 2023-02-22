import { Box, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Color } from '@material-ui/lab/Alert/Alert';
import React, { createContext, ReactNode, useState } from 'react';

type ToastConfig = {
  severity: Color;
  message: string;
};

type AppContextInterface = {
  handleCloseToast: (reason: string) => void;
  handleOpenToast: (message: string, severity: Color) => void;
  toastIsOpen: boolean;
  setToastIsOpen: (toastIsOpen: boolean) => void;
  toastConfig?: ToastConfig;
};

const ToastContext = createContext<AppContextInterface | any>({});

type Props = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: Props) => {
  const [toastIsOpenState, setToastIsOpenState] = useState(false);
  const [toastConfigState, setToastConfigState] = useState<ToastConfig>();

  const handleCloseToast = (reason: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setToastIsOpenState(false);
    // setToastConfigState({});
  };

  const handleOpenToast = (message: string, severity: Color = 'error') => {
    setToastConfigState({
      message,
      severity,
    });
    setToastIsOpenState(true);
  };

  return (
    <ToastContext.Provider
      value={{
        handleCloseToast,
        handleOpenToast,
        toastIsOpen: toastIsOpenState,
        setToastIsOpen: setToastIsOpenState,
        toastConfig: toastConfigState,
      }}
    >
      <Box>
        <div style={{ margin: 15 }}>
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            open={toastIsOpenState}
            autoHideDuration={6000}
            onClose={(_event, reason) => handleCloseToast(reason)}
          >
            <Alert
              onClose={() => handleCloseToast}
              severity={toastConfigState?.severity}
            >
              {toastConfigState?.message}
            </Alert>
          </Snackbar>
          {children}
        </div>
      </Box>
    </ToastContext.Provider>
  );
};

export default ToastContext;

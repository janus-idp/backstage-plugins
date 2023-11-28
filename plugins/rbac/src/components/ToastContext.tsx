import React, { createContext, useContext } from 'react';

type ToastContextType = {
  toastMessage: string;
  setToastMessage: (message: string) => void;
};

export const ToastContext = createContext<ToastContextType>({
  toastMessage: '',
  setToastMessage: () => {},
});

export const ToastContextProvider = (props: any) => {
  const [toastMessage, setToastMessage] = React.useState('');
  const toastContextProviderValue = React.useMemo(
    () => ({ setToastMessage, toastMessage }),
    [setToastMessage, toastMessage],
  );
  return (
    <ToastContext.Provider value={toastContextProviderValue}>
      {props.children}
    </ToastContext.Provider>
  );
};
export const useToast = () => useContext(ToastContext);

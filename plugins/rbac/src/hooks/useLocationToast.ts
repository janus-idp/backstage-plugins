import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useLocationToast = (
  setToastMessage: (message: string) => void,
) => {
  const location = useLocation();

  useEffect(() => {
    if (location?.state?.toastMessage) {
      setToastMessage(location.state.toastMessage);
    }
    return () => setToastMessage('');
  }, [location, setToastMessage]);
};

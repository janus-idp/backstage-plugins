import React, { useEffect } from 'react';
import { ErrorPanel, type ErrorPanelProps } from '@backstage/core-components';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';

const isDevelopment = process.env.NODE_ENV === 'development';

export function ErrorMessage({error}: ErrorPanelProps): JSX.Element | null {
  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    if(isDevelopment) {
      return;
    }

    // simple error message to user
    errorApi.post(new Error('An error has occurred'));
  }, [errorApi])
  
  if(!isDevelopment) {
    return null;
  }

  return <ErrorPanel error={error} defaultExpanded/>
}
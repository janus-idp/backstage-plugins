import React from 'react';
import { useAsyncRetry, useInterval } from 'react-use';

import { LONG_REFRESH_INTERVAL } from '../constants';

const usePolling = <T>(
  fn: () => Promise<T>,
  delayMs = LONG_REFRESH_INTERVAL,
  continueRefresh?: (value: T | undefined) => boolean,
  maxErrorRetries = 3,
) => {
  const [value, setValue] = React.useState<T | undefined>();
  const [error, setError] = React.useState<Error | undefined>();
  const errorCount = React.useRef(0);
  const refreshCount = React.useRef(0);
  const isFirstLoad = refreshCount.current < 2;
  const shouldStop = error || (continueRefresh && !continueRefresh(value));

  const { retry, ...state } = useAsyncRetry<T>(async () => {
    refreshCount.current++;
    const ret = await fn();
    return ret;
  }, []);

  useInterval(retry, shouldStop ? null : delayMs);

  React.useEffect(() => {
    if (state.loading) {
      return;
    } else if (!state.error) {
      errorCount.current = 0;
      setValue(state.value); // preserve value in case of error during polling
      setError(undefined);
    } else if (isFirstLoad || errorCount.current === maxErrorRetries) {
      setError(state.error);
    } else {
      errorCount.current++;
    }
  }, [state, maxErrorRetries, isFirstLoad]);

  return {
    error,
    loading: isFirstLoad && state.loading, // avoid loading indicator while polling
    value,
    restart: () => {
      errorCount.current = 0;
      refreshCount.current = 0;
      retry();
    },
  };
};

export default usePolling;

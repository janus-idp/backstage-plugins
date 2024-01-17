import React, { useCallback, useRef } from 'react';
import { useAsyncFn } from 'react-use';

import { LONG_REFRESH_INTERVAL } from '../constants';

const useTimeoutFn = (fn: Function, ms: number = 0) => {
  // couldn't use useTimeoutFn from react-use as it starts the timeout on mount
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const callback = useRef(fn);

  const set = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      callback.current();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  // update ref when function changes
  React.useEffect(() => {
    callback.current = fn;
  }, [fn]);

  // clear on unmount
  React.useEffect(() => {
    return clear;
  }, [clear]);

  return { clear, set };
};

const usePolling = <T>(
  fn: () => Promise<T>,
  delayMs = LONG_REFRESH_INTERVAL,
  continueRefresh?: (value: T | undefined) => boolean, // must be a pure function that doesn't rely on state
  maxErrorRetries = 3,
) => {
  const [state, asyncFn] = useAsyncFn<() => Promise<T>>(fn);
  const [error, setError] = React.useState<Error | undefined>();
  const [value, setValue] = React.useState<T | undefined>();
  const pollingData = React.useRef({
    polling: false,
    pollingErrorCount: 0,
    continueRefresh,
    maxErrorRetries,
  });

  React.useEffect(() => {
    pollingData.current.continueRefresh = continueRefresh;
    pollingData.current.maxErrorRetries = maxErrorRetries;
  }, [continueRefresh, maxErrorRetries]);

  const { set: startTimeout, clear: clearTimeout } = useTimeoutFn(
    asyncFn,
    delayMs,
  );

  React.useEffect(() => {
    let curError: Error | undefined;
    if (state.loading) {
      return;
    }
    let curValue = value;
    if (state.error) {
      if (!pollingData.current.polling) {
        curError = state.error;
      } else {
        pollingData.current.pollingErrorCount++;
        if (
          pollingData.current.pollingErrorCount >=
          pollingData.current.maxErrorRetries
        ) {
          curError = state.error;
        }
      }
    } else {
      curValue = state.value;
    }
    setError(curError);
    setValue(curValue);
    if (
      !curError &&
      (!pollingData.current.continueRefresh ||
        pollingData.current.continueRefresh(curValue))
    ) {
      pollingData.current.polling = true;
      startTimeout();
    }
    // ignore value update this should only respond to state updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimeout, state]);

  const restart = React.useCallback(() => {
    pollingData.current = {
      ...pollingData.current,
      polling: false,
      pollingErrorCount: 0,
    };
    clearTimeout();
    asyncFn();
  }, [clearTimeout, asyncFn]);

  React.useEffect(() => {
    restart();
  }, [restart]);

  return {
    error,
    loading: !pollingData.current.polling && state.loading,
    value,
    restart,
  };
};

export default usePolling;

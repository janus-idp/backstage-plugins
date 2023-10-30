import { useEffect, useRef } from 'react';

import { DEFAULT_POLLING_INTERVAL } from '../constants';

const noop = () => {};

export const usePollingEffect = (
  asyncCallback: () => Promise<void>,
  dependencies = [],
  interval = DEFAULT_POLLING_INTERVAL,
  onCleanUp = noop,
) => {
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isStopped = false;

    (async function pollingCallback() {
      try {
        if (!isStopped) {
          await asyncCallback();
        }
      } finally {
        // Set timeout after it finished, unless stopped
        timeoutIdRef.current =
          !isStopped && setTimeout(pollingCallback, interval);
      }
    })();

    return () => {
      isStopped = true;
      if (!!timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      onCleanUp();
    };
  }, [
    asyncCallback,
    interval,
    onCleanUp,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...dependencies,
  ]);
};

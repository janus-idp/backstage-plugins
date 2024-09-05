/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useState } from 'react';

import { usePoll } from './poll-hook';

export const URL_POLL_DEFAULT_DELAY = 15000; // 15 seconds

export type UseURLPoll = <R>(
  url: string,
  delay?: number,
  ...dependencies: any[]
) => [R, any, boolean];

export const useURLPoll: UseURLPoll = <R>(
  url: string,
  delay = URL_POLL_DEFAULT_DELAY,
  ...dependencies: any[]
) => {
  const [error, setError] = useState();
  const [response, setResponse] = useState<R>();
  const [loading, setLoading] = useState(true);
  // const safeFetch = useSafeFetch();
  const tick = useCallback(() => {
    if (url) {
      fetch(url)
        .then(data => {
          setResponse(data);
          setError(null);
        })
        .catch(err => {
          if (err.name !== 'AbortError') {
            setResponse(null);
            setError(err);
            // eslint-disable-next-line no-console
            console.error(`Error polling URL: ${err}`);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [url]);

  usePoll(tick, delay, ...dependencies);

  return [response, error, loading];
};

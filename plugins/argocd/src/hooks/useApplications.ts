import * as React from 'react';
import { useAsyncRetry, useInterval } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { argoCDApiRef } from '../api';
import { Application } from '../types';

interface AppOptions {
  instanceName: string;
  appSelector: string;
  intervalMs?: number;
  projectName?: string;
}

export const useApplications = ({
  instanceName,
  appSelector,
  projectName,
  intervalMs = 10000,
}: AppOptions): {
  apps: Application[];
  error: Error | undefined;
  loading: boolean;
} => {
  const [loadingData, setLoadingData] = React.useState<boolean>(true);
  const [, setAppSelector] = React.useState<string>(appSelector ?? '');

  const [apps, setApps] = React.useState<Application[]>([]);

  const api = useApi(argoCDApiRef);

  const getApplications = React.useCallback(async () => {
    return await api
      .listApps({
        url: `/argoInstance/${instanceName}`,
        appSelector,
        projectName,
      })
      .then(applications => setApps(applications?.items ?? []));
  }, [api, appSelector, instanceName, projectName]);

  const { error, loading, retry } = useAsyncRetry(
    async () => await getApplications(),
    [getApplications],
  );

  useInterval(() => retry(), intervalMs);

  React.useEffect(() => {
    let mounted = true;
    if (!loading && mounted) {
      setAppSelector(prevState => {
        if (prevState === appSelector) {
          setLoadingData(false);
          return appSelector;
        }
        setLoadingData(true);

        return appSelector;
      });
    }
    return () => {
      mounted = false;
    };
  }, [loading, appSelector]);

  return { apps, error, loading: loadingData };
};

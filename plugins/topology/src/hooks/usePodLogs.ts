import React from 'react';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import useInterval from 'react-use/lib/useInterval';

import { useApi } from '@backstage/core-plugin-api';

import { ContainerScope } from '../components/Topology/TopologySideBar/PodLogs/types';
import { kubernetesProxyApiRef } from '../types/types';

interface PodLogsOptions {
  podScope: ContainerScope;
  stopPolling: boolean;
  intervalMs?: number;
}

export const usePodLogs = ({
  podScope,
  stopPolling,
  intervalMs = 5000,
}: PodLogsOptions) => {
  const [loadingData, setLoadingData] = React.useState<boolean>(true);
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);
  const getLogs = React.useCallback(async (): Promise<{ text: string }> => {
    const { podName, podNamespace, containerName, clusterName } = podScope;
    return await kubernetesProxyApi.getPodLogs({
      podName: podName,
      namespace: podNamespace,
      containerName: containerName,
      clusterName: clusterName,
    });
  }, [kubernetesProxyApi, podScope]);

  const { value, error, loading, retry } = useAsyncRetry(
    () => getLogs(),
    [getLogs],
  );

  useInterval(() => retry(), stopPolling ? null : intervalMs);

  React.useEffect(() => {
    let mounted = true;
    if (!loading && mounted) {
      setLoadingData(prevState => {
        if (prevState) {
          return false;
        }
        return prevState;
      });
    }
    return () => {
      mounted = false;
    };
  }, [loading]);

  return { value, error, loading: loadingData };
};

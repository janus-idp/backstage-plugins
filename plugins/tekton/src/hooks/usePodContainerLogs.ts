import React from 'react';
import { useAsync } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';
import {
  ContainerScope,
  kubernetesProxyApiRef,
} from '@backstage/plugin-kubernetes';

import { V1Pod } from '@kubernetes/client-node';

import { TektonResourcesContextData } from '../types/types';
import { TektonResourcesContext } from './TektonResourcesContext';

interface PodContainerLogsOptions {
  pod: V1Pod | undefined;
  containerName: string;
  intervalMs?: number;
}

export const usePodContainerLogs = ({
  pod,
  containerName: cName,
}: PodContainerLogsOptions) => {
  const [loadingData, setLoadingData] = React.useState<boolean>(true);
  const [, setPodInfo] = React.useState<string>(pod?.metadata?.name ?? '');
  const kubernetesProxyApi = useApi(kubernetesProxyApiRef);
  const { clusters, selectedCluster } =
    React.useContext<TektonResourcesContextData>(TektonResourcesContext);
  const currCluster =
    (clusters.length > 0 && clusters[selectedCluster || 0]) || '';
  const getLogs = React.useCallback(
    async (podScope: ContainerScope): Promise<{ text: string }> => {
      const {
        podName,
        podNamespace,
        containerName,
        cluster: { name: clusterName },
      } = podScope;
      return await kubernetesProxyApi.getPodLogs({
        podName: podName,
        namespace: podNamespace,
        containerName: containerName,
        clusterName: clusterName,
      });
    },
    [kubernetesProxyApi],
  );

  const { value, error, loading } = useAsync(async () => {
    if (pod?.metadata?.name && pod?.metadata?.namespace) {
      const podScope = {
        containerName: cName,
        podName: pod.metadata.name,
        podNamespace: pod.metadata.namespace,
        cluster: { name: currCluster },
      };
      return getLogs(podScope);
    }
    return null;
  }, [pod, getLogs]);

  React.useEffect(() => {
    let mounted = true;
    if (!loading && mounted) {
      setPodInfo(prevState => {
        if (prevState === pod?.metadata?.name) {
          setLoadingData(false);
          return prevState;
        }
        setLoadingData(true);
        return pod?.metadata?.name || '';
      });
    }
    return () => {
      mounted = false;
    };
  }, [loading, pod]);

  return { value, error, loading: loadingData };
};

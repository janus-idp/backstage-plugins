import { V1Container, V1Pod } from '@kubernetes/client-node';

import { ContainerScope } from '../hooks/usePodLogsOfPipelineRun';

export async function getPodLogs(
  pods: V1Pod[] | [],
  podLogsGetter: (podScope: ContainerScope) => Promise<{ text: string }>,
  currentClusterName: string,
): Promise<string> {
  const containersList = pods.map((pod: V1Pod) => pod?.spec?.containers ?? []);
  const isPodAndContainerAvailable = (
    pod: V1Pod,
    container: V1Container,
  ): boolean => !!(pod && container);

  const requests: Promise<{ text: string }>[] = [];
  containersList.forEach((containers: V1Container[], _idx: number) => {
    containers.forEach((container: V1Container) => {
      const pod: V1Pod = pods[_idx];
      if (isPodAndContainerAvailable(pod, container)) {
        const podScope: ContainerScope = {
          containerName: container.name,
          podName: pod.metadata?.name ?? '',
          podNamespace: pod.metadata?.namespace ?? '',
          clusterName: currentClusterName,
        };

        requests.push(podLogsGetter(podScope));
      }
    });
  });
  return Promise.all(requests).then(response => {
    const containerFlatList = containersList.flat(1);
    return response.reduce(
      (acc: string, r: { text: string }, idx) => {
        const container: V1Container = containerFlatList[idx];
        return acc
          .concat(`${container?.name.toUpperCase()}\n${r?.text}`)
          .concat(idx === containersList.length - 1 ? '' : '\n');
      },

      '',
    );
  });
}

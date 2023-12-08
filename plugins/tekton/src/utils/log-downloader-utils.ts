import { V1Container, V1Pod } from '@kubernetes/client-node';

import { ContainerScope } from '../hooks/usePodLogsOfPipelineRun';

export async function getPodLogs(
  pods: V1Pod[] | [],
  podLogsGetter: (podScope: ContainerScope) => Promise<{ text: string }>,
  currentClusterName: string,
): Promise<string> {
  const containersList = pods.map((pod: V1Pod) => pod?.spec?.containers || []);

  const requests: Promise<{ text: string }>[] = [];
  containersList.forEach((containers: V1Container[], _idx: number) => {
    containers.forEach((container: V1Container) => {
      const pod = pods[_idx];
      if (pod?.metadata?.name && pod?.metadata?.namespace && container) {
        const podScope = {
          containerName: container.name,
          podName: pod.metadata.name,
          podNamespace: pod.metadata.namespace,
          clusterName: currentClusterName,
        };

        requests.push(podLogsGetter(podScope));
      }
    });
  });

  return await (requests.length > 0
    ? Promise.all(requests).then(response => {
        return response.reduce(
          (acc: string, r: { text: string }, idx) => {
            const [container] = containersList[idx];
            if (container?.name && r?.text) {
              return acc
                .concat(`${container.name.toUpperCase()}\n${r?.text}`)
                .concat(idx === containersList.length - 1 ? '' : '\n');
            }
            return acc;
          },

          '',
        );
      })
    : Promise.resolve(''));
}

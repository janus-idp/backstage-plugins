import { useEffect, useState } from 'react';

import { KubernetesObjects } from '@backstage/plugin-kubernetes';

import { K8sResponseData } from '../types/types';
import { getK8sResources } from '../utils/topology-utils';

export const useAllWatchResources = (
  watchedResource: string[] = [],
  k8sObjectsResponse: KubernetesObjects,
  cluster: number,
): K8sResponseData => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [resources, setResources] = useState<K8sResponseData>({});

  useEffect(() => {
    if (!loading && kubernetesObjects && !error) {
      const k8sResources: K8sResponseData = getK8sResources(
        cluster,
        kubernetesObjects,
      );
      if (k8sResources) {
        setResources(k8sResources);
      }
    }
  }, [loading, kubernetesObjects, error, cluster]);

  const watchResourcesData = watchedResource.reduce(
    (acc: K8sResponseData, resKind) => {
      if (resources[resKind]) {
        acc[resKind] = resources[resKind];
      }
      return acc;
    },
    {},
  );

  return watchResourcesData;
};

import { KubernetesObjects } from '@backstage/plugin-kubernetes';
import * as React from 'react';
import { getClusters } from '../utils/topology-utils';

export const useK8sResourcesClusters = (
  k8sObjectsResponse: KubernetesObjects,
) => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [clusters, setClusters] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!loading && kubernetesObjects && !error) {
      const k8sResourcesClusters: string[] = getClusters(kubernetesObjects);
      if (k8sResourcesClusters) {
        setClusters(k8sResourcesClusters);
      }
    }
  }, [loading, kubernetesObjects, error]);

  return { clusters, loading, error };
};

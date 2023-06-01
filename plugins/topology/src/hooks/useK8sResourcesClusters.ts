import { useEffect, useState } from 'react';

import { KubernetesObjects } from '@backstage/plugin-kubernetes';

import { ClusterErrors } from '../types/types';
import { getClusters } from '../utils/topology-utils';

export const useK8sResourcesClusters = (k8sObjectsResponse: KubernetesObjects) => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [clusters, setClusters] = useState<{
    clusters: string[];
    errors: ClusterErrors[];
  }>({ clusters: [], errors: [] });

  useEffect(() => {
    if (!loading && kubernetesObjects && !error) {
      const k8sResourcesClusters = getClusters(kubernetesObjects);
      if (k8sResourcesClusters) {
        setClusters(k8sResourcesClusters);
      }
    }
  }, [loading, kubernetesObjects, error]);

  return clusters;
};

import { useEffect, useState } from 'react';

import { KubernetesObjects } from '@backstage/plugin-kubernetes';

import { ClusterErrors } from '../types/types';
import { getClusters } from '../utils/tekton-utils';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';

export const useResourcesClusters = (k8sObjectsResponse: KubernetesObjects) => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [clusters, setClusters] = useState<{
    clusters: string[];
    errors: ClusterErrors[];
  }>({ clusters: [], errors: [] });

  useEffect(() => {
    let isMounted = true;
    if (isMounted && !loading && kubernetesObjects && !error) {
      const k8sResourcesClusters = getClusters(kubernetesObjects);
      if (k8sResourcesClusters) {
        setClusters(k8sResourcesClusters);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [loading, kubernetesObjects, error]);

  return useDeepCompareMemoize(clusters);
};

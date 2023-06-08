import { useState } from 'react';

import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';

import { K8sResourcesContextData } from '../types/types';
import { useAllWatchResources } from './useAllWatchResources';
import { useK8sResourcesClusters } from './useK8sResourcesClusters';

export const useK8sObjectsResponse = (
  watchedResource: string[],
): K8sResourcesContextData => {
  const { entity } = useEntity();
  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);
  const [selectedCluster, setSelectedCluster] = useState<number>(0);
  const watchResourcesData = useAllWatchResources(
    watchedResource,
    { kubernetesObjects, loading, error },
    selectedCluster,
  );
  const { clusters, errors: clusterErrors } = useK8sResourcesClusters({
    kubernetesObjects,
    loading,
    error,
  });
  return {
    watchResourcesData,
    loading,
    responseError: error,
    selectedClusterErrors: clusterErrors?.[selectedCluster] ?? [],
    clusters,
    setSelectedCluster,
  };
};

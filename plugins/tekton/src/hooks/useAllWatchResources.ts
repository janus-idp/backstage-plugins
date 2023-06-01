import { useEffect, useMemo, useState } from 'react';

import { KubernetesObjects } from '@backstage/plugin-kubernetes';

import { TektonResponseData } from '../types/types';
import { getTektonResources } from '../utils/tekton-utils';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';

export const useAllWatchResources = (
  k8sObjectsResponse: KubernetesObjects,
  cluster: number,
  watchedResource: string[] = [],
): TektonResponseData => {
  const { kubernetesObjects, loading, error } = k8sObjectsResponse;
  const [resources, setResources] = useState<TektonResponseData>({});

  useEffect(() => {
    let isMounted = true;
    if (isMounted && !loading && kubernetesObjects && !error) {
      const tektonResources: TektonResponseData = getTektonResources(cluster, kubernetesObjects);
      if (tektonResources) {
        setResources(tektonResources);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [loading, kubernetesObjects, error, cluster]);

  const watchResourcesData = useMemo(() => {
    return watchedResource.reduce((acc: TektonResponseData, resKind) => {
      if (resources[resKind]) {
        acc[resKind] = resources[resKind];
      }
      return acc;
    }, {});
  }, [watchedResource, resources]);

  return useDeepCompareMemoize(watchResourcesData);
};

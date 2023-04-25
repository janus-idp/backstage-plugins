import { KubernetesObjects } from '@backstage/plugin-kubernetes';
import { useState, useEffect } from 'react';
import { TektonResponseData } from '../types/types';
import { getTektonResources } from '../utils/tekton-utils';

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
      const tektonResources: TektonResponseData = getTektonResources(
        cluster,
        kubernetesObjects,
      );
      if (tektonResources) {
        setResources(tektonResources);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [loading, kubernetesObjects, error, cluster]);

  const watchResourcesData = watchedResource.reduce(
    (acc: TektonResponseData, resKind) => {
      if (resources[resKind]) {
        acc[resKind] = resources[resKind];
      }
      return acc;
    },
    {},
  );

  return watchResourcesData;
};

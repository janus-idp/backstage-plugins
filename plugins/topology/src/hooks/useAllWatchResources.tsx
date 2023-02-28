import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import * as React from 'react';
import { K8sResponse } from '../types/topology-types';
import { K8sResponseData } from '../types/types';
import { getK8sResources } from '../utils/topology-utils';

export const useAllWatchResources = (
  watchedResource: string[] = [],
): K8sResponse => {
  const { entity } = useEntity();
  const { kubernetesObjects, loading, error } = useKubernetesObjects(entity);
  const [resources, setResources] = React.useState<K8sResponseData>({});

  React.useEffect(() => {
    if (!loading && kubernetesObjects && !error) {
      const k8sResources: K8sResponseData = getK8sResources(kubernetesObjects);
      if (k8sResources) {
        setResources(k8sResources);
      }
    }
  }, [loading, kubernetesObjects, error]);

  const watchResourcesData = watchedResource.reduce(
    (acc: K8sResponseData, resKind) => {
      if (resources[resKind]) {
        acc[resKind] = resources[resKind];
      }
      return acc;
    },
    {},
  );

  return { watchResourcesData, loading, error };
};

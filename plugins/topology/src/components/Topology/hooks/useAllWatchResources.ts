import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import * as React from 'react';
import { TopologyResourcesObject } from '../types/topology-types';
import { WatchedResourceType, WatchK8sResults } from '../types/types';
import { getResources } from '../utils/topology-utils';

export const useAllWatchResources = (watchedResource: WatchedResourceType) => {
  const { entity } = useEntity();
  const { kubernetesObjects, error } = useKubernetesObjects(entity);
  const [resources, setResources] = React.useState<
    WatchK8sResults<TopologyResourcesObject>
  >({});

  React.useEffect(() => {
    const fetchData = async () => {
      if (kubernetesObjects && !error) {
        const k8sResources: WatchK8sResults<TopologyResourcesObject> =
          getResources(kubernetesObjects);
        setResources(k8sResources);
      }
    };

    fetchData();
    // Don't update on option changes, its handled differently to not re-layout
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kubernetesObjects, error]);

  const watchResourceKind = Object.keys(watchedResource).reduce(
    (acc: WatchK8sResults<TopologyResourcesObject>, resKind) => {
      if (resources[resKind]) {
        acc[resKind] = resources[resKind];
      }
      return acc;
    },
    {},
  );

  return watchResourceKind;
};

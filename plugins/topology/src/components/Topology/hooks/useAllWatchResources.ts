import { mockResources } from '../../../data/mock-watched-res';
import { TopologyResourcesObject } from '../types/topology-types';
import { WatchedResourceType, WatchK8sResults } from '../types/types';

export const useAllWatchResources = (watchedResource: WatchedResourceType) => {
  const watchResourceKind = Object.keys(watchedResource).reduce(
    (acc: WatchK8sResults<TopologyResourcesObject>, resKind) => {
      if (mockResources[resKind]) {
        acc[resKind] = mockResources[resKind];
      }
      return acc;
    },
    {},
  );

  return watchResourceKind;
};

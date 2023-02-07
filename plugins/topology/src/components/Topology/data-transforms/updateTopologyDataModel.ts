import { Model } from '@patternfly/react-topology';
import { baseDataModelGetter } from './data-transformer';
import { WatchedResourceType, WatchK8sResults } from '../types/types';
import { TopologyResourcesObject } from '../types/topology-types';
import { getWorkloadResources } from '../utils/topology-utils';

export const updateTopologyDataModel = (
  resources: WatchK8sResults<TopologyResourcesObject>,
  watchedResources: WatchedResourceType,
): Promise<{ loaded: boolean; loadError: string; model: Model | null }> => {
  if (!resources) {
    return Promise.resolve({ loaded: false, loadError: '', model: null });
  }

  const getLoadError = (key: string) => {
    if (resources[key].loadError) {
      return resources[key].loadError;
    }
    return '';
  };

  const isLoaded = (key: string) => {
    return resources[key].loaded;
  };

  const loadErrorKey = Object.keys(resources).find(key => getLoadError(key));
  if (loadErrorKey) {
    return Promise.resolve({
      loaded: false,
      loadError: resources[loadErrorKey].loadError,
      model: null,
    });
  }

  if (!Object.keys(resources).every(key => isLoaded(key))) {
    return Promise.resolve({ loaded: false, loadError: '', model: null });
  }

  const workloadResources = getWorkloadResources(resources, watchedResources);
  const topologyModel: Model = {
    nodes: [],
    edges: [],
  };

  const fullModel = baseDataModelGetter(
    topologyModel,
    resources,
    workloadResources,
  );

  return Promise.resolve({ loaded: true, loadError: '', model: fullModel });
};

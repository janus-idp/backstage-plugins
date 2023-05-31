import { Model } from '@patternfly/react-topology';

import { K8sResponseData } from '../types/types';
import { getWorkloadResources } from '../utils/topology-utils';
import { baseDataModelGetter } from './data-transformer';

export const updateTopologyDataModel = (
  resources: K8sResponseData,
): Promise<{ loaded: boolean; loadError: string; model: Model | null }> => {
  if (!resources) {
    return Promise.resolve({ loaded: false, loadError: '', model: null });
  }

  const workloadResources = getWorkloadResources(resources);
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

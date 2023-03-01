import * as React from 'react';
import {
  Visualization,
  VisualizationProvider,
} from '@patternfly/react-topology';
import defaultLayoutFactory from '../layouts/defaultLayoutFactory';
import TopologyComponentFactory from '../Graph/TopologyComponentFactory';
import TopologyViewWorkloadComponent from './TopologyViewWorkloadComponent';
import { KubernetesObjects } from '@backstage/plugin-kubernetes';
import { useAllWatchResources } from '../../hooks/useAllWatchResources';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';

export const TopologyWorkloadView = React.memo<{
  k8sObjectsResponse: KubernetesObjects;
  watchedResources: string[];
  onClusterChange: React.Dispatch<React.SetStateAction<number>>;
}>(({ k8sObjectsResponse, watchedResources, onClusterChange }) => {
  const controller = new Visualization();
  controller.registerLayoutFactory(defaultLayoutFactory);
  controller.registerComponentFactory(TopologyComponentFactory);
  const k8sResponseData = useAllWatchResources(
    watchedResources,
    k8sObjectsResponse,
  );

  return (
    <K8sResourcesContext.Provider value={k8sResponseData}>
      <VisualizationProvider controller={controller}>
        <TopologyViewWorkloadComponent
          useToolbar
          onClusterChange={onClusterChange}
        />
      </VisualizationProvider>
    </K8sResourcesContext.Provider>
  );
});

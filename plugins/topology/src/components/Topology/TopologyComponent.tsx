import React from 'react';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/react-core/dist/styles/base.css';
import { useTheme } from '@material-ui/core/styles';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import { TopologyWorkloadView } from './TopologyWorkloadView';
import { ModelsPlural } from '../../models';
import {
  K8sResourcesClusterContext,
  K8sResourcesClustersContext,
} from '../../hooks/K8sResourcesContext';

import './TopologyComponent.css';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useKubernetesObjects } from '@backstage/plugin-kubernetes';
import { useK8sResourcesClusters } from '../../hooks/useK8sResourcesClusters';

const THEME_DARK = 'dark';
const THEME_DARK_CLASS = 'pf-theme-dark';

export const TopologyComponent = () => {
  const { entity } = useEntity();
  const k8sObjectsResponse = useKubernetesObjects(entity);
  const {
    palette: { type },
  } = useTheme();
  const [clusterContext, setClusterContext] = React.useState(0);
  React.useEffect(() => {
    const htmlTagElement = document.documentElement;
    if (type === THEME_DARK) {
      htmlTagElement.classList.add(THEME_DARK_CLASS);
    } else {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const watchedResources = [
    ModelsPlural.deployments,
    ModelsPlural.pods,
    ModelsPlural.services,
    ModelsPlural.replicasets,
    ModelsPlural.ingresses,
  ];

  const k8sResourcesClusters = useK8sResourcesClusters(k8sObjectsResponse);

  return (
    <K8sResourcesClustersContext.Provider value={k8sResourcesClusters.clusters}>
      <K8sResourcesClusterContext.Provider value={clusterContext}>
        <div className="pf-ri__topology">
          <TopologyWorkloadView
            k8sObjectsResponse={k8sObjectsResponse}
            watchedResources={watchedResources}
            onClusterChange={setClusterContext}
          />
        </div>
      </K8sResourcesClusterContext.Provider>
    </K8sResourcesClustersContext.Provider>
  );
};

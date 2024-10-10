import React from 'react';

import { useTheme } from '@material-ui/core/styles';

import { FilterContext } from '../../hooks/FilterContext';
import { K8sResourcesContext } from '../../hooks/K8sResourcesContext';
import { useFilterContextValues } from '../../hooks/useFilterContextValues';
import { useK8sObjectsResponse } from '../../hooks/useK8sObjectsResponse';
import { ModelsPlural } from '../../models';
import { ModelsPlural as TektonModels } from '../../pipeline-models';
import { TopologyWorkloadView } from './TopologyWorkloadView';

import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly-theme-dark.css';
import '@patternfly/patternfly/patternfly-charts-theme-dark.css';
import '@patternfly/patternfly/utilities/Accessibility/accessibility.css';
import './TopologyComponent.css';

const THEME_DARK = 'dark';
const THEME_DARK_CLASS = 'pf-v5-theme-dark';

const savedStylesheets = new Set<HTMLLinkElement>();

export const TopologyComponent = () => {
  const {
    palette: { type },
  } = useTheme();

  React.useLayoutEffect(() => {
    const htmlTagElement = document.documentElement;

    const scalprumStyles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"]'),
    ).filter(link =>
      link.attributes
        .getNamedItem('href')
        ?.value?.includes('backstage-plugin-topology'),
    );

    scalprumStyles.forEach(link =>
      savedStylesheets.add(link as HTMLLinkElement),
    );

    savedStylesheets.forEach(link => {
      if (!document.head.contains(link)) {
        document.head.appendChild(link);
      }
    });

    if (type === THEME_DARK) {
      htmlTagElement.classList.add(THEME_DARK_CLASS);
    } else {
      htmlTagElement.classList.remove(THEME_DARK_CLASS);
    }

    return () => {
      savedStylesheets.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });

      if (htmlTagElement.classList.contains(THEME_DARK_CLASS)) {
        htmlTagElement.classList.remove(THEME_DARK_CLASS);
      }
    };
  }, [type]);

  const watchedResources = [
    ModelsPlural.deployments,
    ModelsPlural.pods,
    ModelsPlural.services,
    ModelsPlural.replicasets,
    ModelsPlural.ingresses,
    ModelsPlural.daemonsets,
    ModelsPlural.statefulsets,
    ModelsPlural.cronjobs,
    ModelsPlural.jobs,
    ModelsPlural.routes,
    TektonModels.taskruns,
    TektonModels.pipelineruns,
    TektonModels.pipelines,
    ModelsPlural.checlusters,
    ModelsPlural.virtualmachines,
    ModelsPlural.virtualmachineinstances,
  ];

  const k8sResourcesContextData = useK8sObjectsResponse(watchedResources);
  const filterContextData = useFilterContextValues();

  return (
    <K8sResourcesContext.Provider value={k8sResourcesContextData}>
      <FilterContext.Provider value={filterContextData}>
        <div className="pf-ri__topology">
          <TopologyWorkloadView />
        </div>
      </FilterContext.Provider>
    </K8sResourcesContext.Provider>
  );
};

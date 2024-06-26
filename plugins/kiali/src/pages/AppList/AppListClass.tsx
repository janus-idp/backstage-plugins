import { AppList, AppListItem } from '../../types/AppList';
import { AppHealth } from '../../types/Health';
import { sortIstioReferences } from './FiltersAndSorts';

export const getAppItems = (
  data: AppList,
  rateInterval: number,
): AppListItem[] => {
  if (data.applications) {
    return data.applications.map(app => ({
      namespace: app.namespace,
      name: app.name,
      istioSidecar: app.istioSidecar,
      istioAmbient: app.istioAmbient,
      health: AppHealth.fromJson(app.namespace, app.name, app.health, {
        rateInterval: rateInterval,
        hasSidecar: app.istioSidecar,
        hasAmbient: app.istioAmbient,
      }),
      labels: app.labels,
      istioReferences: sortIstioReferences(app.istioReferences, true),
      cluster: app.cluster,
    }));
  }
  return [];
};

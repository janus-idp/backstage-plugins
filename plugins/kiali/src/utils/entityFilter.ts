import { Entity } from '@backstage/catalog-model';

import {
  KUBERNETES_ANNOTATION,
  KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION,
  KUBERNETES_NAMESPACE,
} from '../Router';
import { Namespace } from '../types/Namespace';
import { WorkloadListItem, WorkloadNamespaceResponse } from '../types/Workload';

const filterById = (ns: Namespace[], value: string): Namespace[] => {
  const values = value.split(',');
  return ns.filter(
    n => n.labels && values.includes(n.labels[KUBERNETES_ANNOTATION]),
  );
};

const filterBySelector = (ns: Namespace[], value: string): Namespace[] => {
  const values = value.split(',');
  return ns.filter(
    n =>
      values.filter(v => {
        const [key, valueLabel] = v.split('=');
        return n.labels && n.labels[key] === valueLabel;
      }).length > 0,
  );
};

const filterByNs = (ns: Namespace[], value: string): Namespace[] => {
  const values = value.split(',');
  return ns.filter(n => values.includes(n.name));
};

export const filterNsByAnnotation = (
  ns: Namespace[],
  entity: Entity | undefined,
): Namespace[] => {
  if (!entity) {
    return ns;
  }
  const annotations = entity?.metadata?.annotations || undefined;
  if (!annotations) {
    return [];
  }

  let nsFilter = ns;
  nsFilter = annotations[KUBERNETES_ANNOTATION]
    ? filterById(
        nsFilter,
        decodeURIComponent(annotations[KUBERNETES_ANNOTATION]),
      )
    : nsFilter;
  nsFilter = annotations[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION]
    ? filterBySelector(
        nsFilter,
        decodeURIComponent(
          annotations[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION],
        ),
      )
    : nsFilter;
  nsFilter = annotations[KUBERNETES_NAMESPACE]
    ? filterByNs(
        nsFilter,
        decodeURIComponent(annotations[KUBERNETES_NAMESPACE]),
      )
    : nsFilter;
  return nsFilter;
};

/* Workloads */
const filterWkById = (
  wk: WorkloadListItem[],
  value: string,
): WorkloadListItem[] => {
  const values = value.split(',');
  return wk.filter(
    n => n.labels && values.includes(n.labels[KUBERNETES_ANNOTATION]),
  );
};

const filterByWk = (
  wk: WorkloadListItem[],
  value: string,
): WorkloadListItem[] => {
  const values = value.split(',');
  return wk.filter(n => values.includes(n.name));
};

const filterWkBySelector = (
  wk: WorkloadListItem[],
  value: string,
): WorkloadListItem[] => {
  const values = value.split(',');
  return wk.filter(
    n =>
      values.filter(v => {
        const [key, valueLabel] = v.split('=');
        return n.labels && n.labels[key] === valueLabel;
      }).length > 0,
  );
};

// TODO: Filtering is not being done (It returns no data...?)
export const filterWkByAnnotation = (
  wkResp: WorkloadNamespaceResponse,
  entity: Entity | undefined,
  global: boolean = false,
): WorkloadListItem[] => {
  const wk = wkResp.workloads;
  const woList = wk.map(w => {
    return {
      name: w.name,
      namespace: wkResp.namespace.name,
      cluster: w.cluster,
      type: w.type,
      istioSidecar: w.istioSidecar,
      istioAmbient: w.istioAmbient,
      additionalDetailSample: undefined,
      appLabel: w.appLabel,
      versionLabel: w.versionLabel,
      labels: w.labels,
      istioReferences: w.istioReferences,
      notCoveredAuthPolicy: w.notCoveredAuthPolicy,
      health: w.health,
    };
  });

  if (global || !entity) {
    return woList;
  }
  const annotations = entity?.metadata?.annotations || undefined;
  if (!annotations) {
    return [];
  }

  let wkFilter: WorkloadListItem[] = woList;
  wkFilter = annotations[KUBERNETES_ANNOTATION]
    ? filterWkById(
        wkFilter,
        decodeURIComponent(annotations[KUBERNETES_ANNOTATION]),
      )
    : wkFilter;
  wkFilter = annotations[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION]
    ? filterWkBySelector(
        wkFilter,
        decodeURIComponent(
          annotations[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION],
        ),
      )
    : wkFilter;
  wkFilter = annotations[KUBERNETES_NAMESPACE]
    ? filterByWk(
        wkFilter,
        decodeURIComponent(annotations[KUBERNETES_NAMESPACE]),
      )
    : wkFilter;
  return woList;
};

export const exportedForTesting = {
  filterById,
  filterBySelector,
  filterByNs,
};

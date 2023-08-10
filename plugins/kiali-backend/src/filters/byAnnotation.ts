import { Entity } from '@backstage/catalog-model';

import {
  KUBERNETES_ANNOTATION,
  KUBERNETES_LABEL_SELECTOR,
  KUBERNETES_NAMESPACE,
  Namespace,
  NamespaceInfo,
} from '@janus-idp/backstage-plugin-kiali-common';

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

const filterByNs = (ns: Namespace[], value: string): NamespaceInfo[] => {
  const values = value.split(',');
  return ns.filter(n => values.includes(n.name));
};

export const filterNsByAnnotation = (
  ns: Namespace[],
  entity: Entity,
): Namespace[] => {
  const annotations = entity.metadata.annotations;
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
  nsFilter = annotations[KUBERNETES_LABEL_SELECTOR]
    ? filterBySelector(
        nsFilter,
        decodeURIComponent(annotations[KUBERNETES_LABEL_SELECTOR]),
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

export const exportedForTesting = {
  filterById,
  filterBySelector,
  filterByNs,
};

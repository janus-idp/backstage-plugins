import {
  KUBERNETES_ANNOTATION,
  KUBERNETES_LABEL_SELECTOR,
  KUBERNETES_NAMESPACE,
  Namespace,
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

const filterByNs = (ns: Namespace[], value: string): Namespace[] => {
  const values = value.split(',');
  return ns.filter(n => values.includes(n.name));
};

export const filterNsByAnnotation = (
  ns: Namespace[],
  annotation?: { [key: string]: string },
): Namespace[] => {
  if (!annotation) {
    return ns;
  }
  let nsFilter = ns;
  nsFilter = annotation[KUBERNETES_ANNOTATION]
    ? filterById(
        nsFilter,
        decodeURIComponent(annotation[KUBERNETES_ANNOTATION]),
      )
    : nsFilter;
  nsFilter = annotation[KUBERNETES_LABEL_SELECTOR]
    ? filterBySelector(
        nsFilter,
        decodeURIComponent(annotation[KUBERNETES_LABEL_SELECTOR]),
      )
    : nsFilter;
  nsFilter = annotation[KUBERNETES_NAMESPACE]
    ? filterByNs(nsFilter, decodeURIComponent(annotation[KUBERNETES_NAMESPACE]))
    : nsFilter;
  return nsFilter;
};

export const exportedForTesting = {
  filterById,
  filterBySelector,
  filterByNs,
};

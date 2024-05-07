import { Entity } from '@backstage/catalog-model';

import { KUBERNETES_NAMESPACE } from '../components/Router';

export const nsEqual = (ns: string[], ns2: string[]): boolean => {
  return (
    ns.length === ns2.length &&
    ns.every((value: any, index: number) => value === ns2[index])
  );
};

export const getEntityNs = (entity: Entity): string[] => {
  const annotations = entity?.metadata?.annotations || undefined;
  if (!annotations) {
    return [];
  }
  const ant = decodeURIComponent(annotations[KUBERNETES_NAMESPACE]);
  if (ant) {
    return ant.split(',');
  }
  return [];
};

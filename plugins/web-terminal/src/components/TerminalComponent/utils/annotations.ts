import { Entity } from '@backstage/catalog-model';

export const KUBERNETES_API_SERVER = 'kubernetes.io/api-server';

/** @public */
export const isWebTerminalAvailable = (entity: Entity): boolean =>
  Boolean(entity.metadata.annotations?.[KUBERNETES_API_SERVER]);

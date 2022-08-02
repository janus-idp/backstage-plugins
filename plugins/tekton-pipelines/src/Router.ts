import { Entity } from '@backstage/catalog-model';

export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';

export const isTektonCiAvailable = (entity: Entity) => (Boolean(entity?.metadata.annotations?.[TEKTON_PIPELINES_BUILD_NAMESPACE]));

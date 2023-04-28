import { Entity } from '@backstage/catalog-model';
import { AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME } from '../consts';

export const useAcrAppData = ({ entity }: { entity: Entity }) => {
  const imageName =
    entity?.metadata.annotations?.[AZURE_CONTAINER_REGISTRY_ANNOTATION_IMAGE_NAME] ??
    '';

  if (!imageName) {
    throw new Error("'Azure container registry' annotations are missing");
  }
  return { imageName };
};

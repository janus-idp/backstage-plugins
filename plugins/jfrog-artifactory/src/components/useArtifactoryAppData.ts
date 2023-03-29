import { Entity } from '@backstage/catalog-model';

export const ARTIFACTORY_ANNOTATION_IMAGE_NAME = 'artifactory/image-name';

export const useArtifactoryAppData = ({ entity }: { entity: Entity }) => {
  const imageName =
    entity?.metadata.annotations?.[ARTIFACTORY_ANNOTATION_IMAGE_NAME] ?? '';

  if (!imageName) {
    throw new Error("'Artifactory' annotations are missing");
  }
  return { imageName };
};

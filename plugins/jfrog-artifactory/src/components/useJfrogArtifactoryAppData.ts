import { Entity } from '@backstage/catalog-model';

export const JFROG_ARTIFACTORY_ANNOTATION_IMAGE_NAME =
  'jfrog-artifactory/image-name';

export const useJfrogArtifactoryAppData = ({ entity }: { entity: Entity }) => {
  const imageName =
    entity?.metadata.annotations?.[JFROG_ARTIFACTORY_ANNOTATION_IMAGE_NAME] ??
    '';

  if (!imageName) {
    throw new Error("'Jfrog Artifactory' annotations are missing");
  }
  return { imageName };
};

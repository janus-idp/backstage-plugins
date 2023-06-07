import { Entity } from '@backstage/catalog-model';

export const JFROG_ARTIFACTORY_ANNOTATION_PACKAGE_NAME =
  'jfrog-artifactory/package-name';

export const useJfrogArtifactoryAppData = ({ entity }: { entity: Entity }) => {
  const packageName =
    entity?.metadata.annotations?.[JFROG_ARTIFACTORY_ANNOTATION_PACKAGE_NAME] ??
    '';

  if (!packageName) {
    throw new Error("'Jfrog Artifactory' annotations are missing");
  }
  return { packageName };
};

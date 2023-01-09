import { Entity } from '@backstage/catalog-model'

export const QUAY_ANNOTATION_REPOSITORY = 'quay.io/repository-slug'

export const useQuayAppData = ({ entity }: { entity: Entity }) => {
  const repositorySlug =
    entity?.metadata.annotations?.[QUAY_ANNOTATION_REPOSITORY] ?? ''

  if (!repositorySlug) {
    throw new Error("'Quay' annotations are missing")
  }
  return { repositorySlug }
}
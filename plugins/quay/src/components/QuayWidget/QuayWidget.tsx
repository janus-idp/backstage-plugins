import { Entity } from '@backstage/catalog-model'
import { MissingAnnotationEmptyState } from '@backstage/core-components'
import { useEntity } from '@backstage/plugin-catalog-react'
import { Card, CardHeader } from '@material-ui/core'
import React from 'react'
import { isQuayAvailable } from '../../plugin'
import { QuayRepository } from '../QuayRepository'
import {
  QUAY_ANNOTATION_REPOSITORY,
  useQuayAppData,
} from '../useQuayAppData'

const Widget = ({ entity }: { entity: Entity }) => {
  const { repositorySlug } = useQuayAppData({ entity })
  const info = repositorySlug.split('/')

  const organization = info.shift() as 'string'
  const repository = info.join('/')

  return (
    <Card>
      <CardHeader title="Docker Image" />
      <QuayRepository organization={organization} repository={repository} widget />
    </Card>
  )
}

export const QuayWidget = () => {
  const { entity } = useEntity()

  return !isQuayAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={QUAY_ANNOTATION_REPOSITORY} />
  ) : (
    <Widget entity={entity} />
  )
}

export const QuayWidgetEntity = ({ entity }: { entity: Entity }) => {
  return !isQuayAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={QUAY_ANNOTATION_REPOSITORY} />
  ) : (
    <Widget entity={entity} />
  )
}
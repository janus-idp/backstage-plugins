import { useEntity } from '@backstage/plugin-catalog-react'
import React from 'react'
import { QuayRepository } from '../QuayRepository'
import { useQuayAppData } from '../useQuayAppData'

export const QuayDashboardPage = () => {
  const { entity } = useEntity()
  const { repositorySlug } = useQuayAppData({ entity })
  const info = repositorySlug.split('/')

  const organization = info.shift() as 'string'
  const repository = info.join('/')

  return (
    <QuayRepository
      organization={organization}
      repository={repository}
      widget={false}
    />
  )
}
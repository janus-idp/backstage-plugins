import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api'

export interface quayApi {}

export const quayApiRef = createApiRef<quayApi>({
  id: 'plugin.quay.service',
})

export type Options = {
  discoveryApi: DiscoveryApi
  proxyPath?: string
}

export class QuayApiClient implements quayApi {
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi
  }
}
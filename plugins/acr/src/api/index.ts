import {
  DiscoveryApi,
  ConfigApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import { TagsResponse } from '../types';

const DEFAULT_PROXY_PATH = '/acr/api';

export interface AzureContainerRegistryApiV1 {
  getTags(repo: string): Promise<TagsResponse>;
}

export const AzureContainerRegistryApiRef =
  createApiRef<AzureContainerRegistryApiV1>({
    id: 'plugin.acr.service',
  });

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class AzureContainerRegistryApiClient
  implements AzureContainerRegistryApiV1
{
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;
  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
  }

  private async getBaseUrl() {
    const proxyPath =
      this.configApi.getOptionalString('acr.proxyPath') || DEFAULT_PROXY_PATH;
    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  private async fetcher(url: string) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  async getTags(repo: string) {
    const proxyUrl = await this.getBaseUrl();

    return (await this.fetcher(`${proxyUrl}/${repo}/_tags`)) as TagsResponse;
  }
}

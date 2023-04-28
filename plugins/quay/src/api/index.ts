import {
  DiscoveryApi,
  ConfigApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import {
  TagsResponse,
  LabelsResponse,
  ManifestByDigestResponse,
  SecurityDetailsResponse,
} from '../types';

const DEFAULT_PROXY_PATH = '/quay/api';

export interface QuayApiV1 {
  getTags(
    org: string,
    repo: string,
    page?: number,
    limit?: number,
  ): Promise<TagsResponse>;
  getLabels(org: string, repo: string, digest: string): Promise<LabelsResponse>;
  getManifestByDigest(
    org: string,
    repo: string,
    digest: string,
  ): Promise<ManifestByDigestResponse>;
  getSecurityDetails(
    org: string,
    repo: string,
    digest: string,
  ): Promise<SecurityDetailsResponse>;
}

export const quayApiRef = createApiRef<QuayApiV1>({
  id: 'plugin.quay.service',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class QuayApiClient implements QuayApiV1 {
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;

  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
  }

  private async getBaseUrl() {
    const proxyPath =
      this.configApi.getOptionalString('quay.proxyPath') || DEFAULT_PROXY_PATH;
    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  private async fetcher(url: string) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  private encodeGetParams(params: Record<string, any>) {
    return Object.keys(params)
      .filter(key => typeof params[key] !== 'undefined')
      .map(
        k =>
          `${encodeURIComponent(k)}=${encodeURIComponent(params[k] as string)}`,
      )
      .join('&');
  }

  async getTags(
    org: string,
    repo: string,
    page?: number,
    limit?: number,
    specifcTag?: string,
  ) {
    const proxyUrl = await this.getBaseUrl();

    const params = this.encodeGetParams({
      limit,
      page,
      onlyActiveTags: true,
      specifcTag,
    });

    return (await this.fetcher(
      `${proxyUrl}/api/v1/repository/${org}/${repo}/tag/?${params}`,
    )) as TagsResponse;
  }

  async getLabels(org: string, repo: string, digest: string) {
    const proxyUrl = await this.getBaseUrl();

    return (await this.fetcher(
      `${proxyUrl}/api/v1/repository/${org}/${repo}/manifest/${digest}/labels`,
    )) as LabelsResponse;
  }

  async getManifestByDigest(org: string, repo: string, digest: string) {
    const proxyUrl = await this.getBaseUrl();

    return (await this.fetcher(
      `${proxyUrl}/api/v1/repository/${org}/${repo}/manifest/${digest}`,
    )) as ManifestByDigestResponse;
  }

  async getSecurityDetails(org: string, repo: string, digest: string) {
    const proxyUrl = await this.getBaseUrl();

    const params = this.encodeGetParams({
      vulnerabilities: true,
    });

    return (await this.fetcher(
      `${proxyUrl}/api/v1/repository/${org}/${repo}/manifest/${digest}/security?${params}`,
    )) as SecurityDetailsResponse;
  }
}

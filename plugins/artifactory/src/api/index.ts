import {
  DiscoveryApi,
  ConfigApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import { TagsResponse } from '../types';

const DEFAULT_PROXY_PATH = '/artifactory/api';

export interface ArtifactoryApiV1 {
  getTags(repo: string): Promise<TagsResponse>;
}

export const artifactoryApiRef = createApiRef<ArtifactoryApiV1>({
  id: 'plugin.artifactory.service',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class ArtifactoryApiClient implements ArtifactoryApiV1 {
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;

  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
  }

  private async getBaseUrl() {
    const proxyPath =
      this.configApi.getOptionalString('artifactory.proxyPath') ||
      DEFAULT_PROXY_PATH;
    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  private async fetcher(url: string, query: string) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: query,
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
    const tagQuery = {
      query:
        'query ($filter: VersionFilter!, $first: Int, $orderBy: VersionOrder) { versions (filter: $filter, first: $first, orderBy: $orderBy) { edges { node { name, created, modified, package { id }, repos { name, type, leadFilePath }, licenses { name, source }, size, stats { downloadCount }, vulnerabilities { critical, high, medium, low, info, unknown, skipped }, files { name, lead, size, md5, sha1, sha256, mimeType } } } } }',
      variables: {
        filter: {
          packageId: `docker://${repo}`,
          name: '*',
          ignorePreRelease: false,
        },
        first: 100,
        orderBy: {
          field: 'NAME_SEMVER',
          direction: 'DESC',
        },
      },
    };

    return (await this.fetcher(
      `${proxyUrl}/metadata/api/v1/query`,
      JSON.stringify(tagQuery),
    )) as TagsResponse;
  }
}

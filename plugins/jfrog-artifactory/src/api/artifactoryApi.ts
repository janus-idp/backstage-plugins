import {
  DiscoveryApi,
  ConfigApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import { PackageResponse } from '../types';

const DEFAULT_PROXY_PATH = '/jfrog-artifactory/api';

export interface JfrogArtifactoryApiV1 {
  getArtifact(repo: string): Promise<PackageResponse>;
}

export const jfrogArtifactoryApiRef = createApiRef<JfrogArtifactoryApiV1>({
  id: 'plugin.jfrog-artifactory.service',
});

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class JfrogArtifactoryApiClient implements JfrogArtifactoryApiV1 {
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;

  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
  }

  private async getBaseUrl() {
    const proxyPath =
      this.configApi.getOptionalString('jfrogArtifactory.proxyPath') ||
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

  async getArtifact(repo: string) {
    const proxyUrl = await this.getBaseUrl();
    const packageQuery = {
      query: `query ($filter: PackageFilter!, $orderBy: PackageOrder) {
        packages(filter: $filter, orderBy: $orderBy) {
          edges {
            node {
              name,
              description,
              created,
              versions {
                name,
                size,
                repos {
                  name
                },
                package {
                  packageType
                },
                vulnerabilities {
                  critical,
                  high,
                  medium,
                  low,
                  info,
                  unknown,
                  skipped
                },
                stats {
                  downloadCount
                }
              }
            }
          }
        }
      }`,
      variables: {
        filter: {
          name: `*${repo}`,
        },
        orderBy: {
          field: 'NAME',
          direction: 'DESC',
        },
      },
    };

    return (await this.fetcher(
      `${proxyUrl}/metadata/api/v1/query`,
      JSON.stringify(packageQuery),
    )) as PackageResponse;
  }
}

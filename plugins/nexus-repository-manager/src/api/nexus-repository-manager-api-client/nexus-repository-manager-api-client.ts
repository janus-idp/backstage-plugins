import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import {
  NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
  NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
} from '../../annotations';
import { OpenAPI, SearchService } from '../../generated';
import type {
  Annotation,
  ComponentXO,
  RawAsset,
  SearchServiceQuery,
} from '../../types';

const DEFAULT_PROXY_PATH = '/nexus-repository-manager' as const;
const NEXUS_REPOSITORY_MANAGER_CONFIG = {
  proxyPath: 'nexusRepositoryManager.proxyPath',
  experimentalAnnotations: 'nexusRepositoryManager.experimentalAnnotations',
} as const;

/**
 * Indicates that we want manifest v2 schema 2 if possible. It's faster
 * for supporting servers to return and contains size information.
 * @see {@link https://docs.docker.com/registry/spec/manifest-v2-2/#backward-compatibility|Backward compatibility}
 */
const DOCKER_MANIFEST_HEADERS = {
  Accept: [
    'application/vnd.docker.distribution.manifest.v2+json',
    'application/vnd.docker.distribution.manifest.v1+json;q=0.9',
    '*/*;q=0.8',
  ].join(', '),
} as const satisfies HeadersInit;

function getAdditionalHeaders(format?: string): HeadersInit {
  switch (format /* NOSONAR - use switch for expandability */) {
    case 'docker':
      return DOCKER_MANIFEST_HEADERS;
    default:
      return {};
  }
}

export type NexusRepositoryManagerApiV1 = {
  getComponents(query: SearchServiceQuery): Promise<{
    components: {
      component: ComponentXO;
      rawAssets: (RawAsset | null)[];
    }[];
  }>;
  getAnnotations(): { ANNOTATIONS: Readonly<Annotation[]> };
};

export const NexusRepositoryManagerApiRef =
  createApiRef<NexusRepositoryManagerApiV1>({
    id: 'plugin.nexus-repository-manager.service',
  });

export type NexusRepositoryManagerApiClientOptions = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class NexusRepositoryManagerApiClient
  implements NexusRepositoryManagerApiV1
{
  private readonly discoveryApi: DiscoveryApi;
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: NexusRepositoryManagerApiClientOptions) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  private async getBaseUrl() {
    const proxyPath =
      this.configApi.getOptionalString(
        NEXUS_REPOSITORY_MANAGER_CONFIG.proxyPath,
      ) ?? DEFAULT_PROXY_PATH;
    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  private async searchServiceFetcher(url: string, query: SearchServiceQuery) {
    const { token: idToken } = await this.identityApi.getCredentials();

    OpenAPI.BASE = url;
    OpenAPI.TOKEN = idToken;

    return await SearchService.search(query);
  }

  private async fetcher(url: string, additionalHeaders: HeadersInit = {}) {
    const { token: idToken } = await this.identityApi.getCredentials();

    const headers = new Headers(additionalHeaders);
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    if (idToken) {
      headers.set('Authorization', `Bearer ${idToken}`);
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }
    return await response.json();
  }

  private async getRawAsset(url?: string, additionalHeaders: HeadersInit = {}) {
    const proxyUrl = await this.getBaseUrl();

    if (!url) {
      return null;
    }

    const path = /\/(repository\/.*)/.exec(url)?.at(1);

    return (await this.fetcher(
      `${proxyUrl}/${path}`,
      additionalHeaders,
    )) as RawAsset;
  }

  private async getRawAssets(component: ComponentXO) {
    const additionalHeaders = getAdditionalHeaders(component.format);

    const assets = await Promise.all(
      component.assets?.map(
        async asset =>
          await this.getRawAsset(asset.downloadUrl, additionalHeaders),
        // Create a dummy promise to avoid Promise.all() from failing
      ) ?? [new Promise<null>(() => null)],
    );

    return assets;
  }

  async getComponents(query: SearchServiceQuery) {
    const proxyUrl = await this.getBaseUrl();

    const components: ComponentXO[] = [];
    let continuationToken: undefined | string;

    do {
      const res = await this.searchServiceFetcher(`${proxyUrl}/service/rest`, {
        ...query,
        continuationToken,
      });

      continuationToken = res.continuationToken;
      components.push(...(res.items ?? []));
    } while (continuationToken);

    const value = await Promise.all(
      components.map(async component => ({
        component,
        rawAssets: await this.getRawAssets(component),
      })),
    );

    return {
      components: value,
    };
  }

  getAnnotations() {
    const usesExperimental = this.configApi.getOptionalBoolean(
      NEXUS_REPOSITORY_MANAGER_CONFIG.experimentalAnnotations,
    );

    if (usesExperimental) {
      return {
        ANNOTATIONS: [
          ...NEXUS_REPOSITORY_MANAGER_ANNOTATIONS,
          ...NEXUS_REPOSITORY_MANAGER_EXPERIMENTAL_ANNOTATIONS,
        ],
      };
    }

    return { ANNOTATIONS: NEXUS_REPOSITORY_MANAGER_ANNOTATIONS };
  }
}

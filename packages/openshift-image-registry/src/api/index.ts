import {
  DiscoveryApi,
  ConfigApi,
  createApiRef,
} from '@backstage/core-plugin-api';

const DEFAULT_PROXY_PATH = '/openshift-image-registry/api';

export interface OpenshiftImageRegistryApiV1 {
  getImageStreams(ns: string): Promise<any>;
  getImageStreamTags(imageStream: any): Promise<any>;
  getNamespaces(): Promise<any>;
}

export const openshiftImageRegistryApiRef =
  createApiRef<OpenshiftImageRegistryApiV1>({
    id: 'plugin.openshift-image-registry.service',
  });

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class OpenshiftImageRegistryApiClient
  implements OpenshiftImageRegistryApiV1
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
      this.configApi.getOptionalString('openshiftImageRegistry.proxyPath') ||
      DEFAULT_PROXY_PATH;
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

  async getNamespaces() {
    const proxyUrl = await this.getBaseUrl();
    return (await this.fetcher(`${proxyUrl}/api/v1/namespaces`)).items as any[];
  }

  async getImageStreams(ns: string) {
    const proxyUrl = await this.getBaseUrl();
    return (
      await this.fetcher(
        `${proxyUrl}/apis/image.openshift.io/v1/namespaces/${ns}/imagestreams`,
      )
    ).items as any[];
  }

  async getImageStreamTags(imageStream: any) {
    const ns = imageStream.metadata.namespace;
    const name = imageStream.metadata.name;
    const allTags = imageStream.status.tags.map((tag: any) => tag.tag);

    const proxyUrl = await this.getBaseUrl();

    return Promise.all(
      allTags.map(
        async (tag: any) =>
          await this.fetcher(
            `${proxyUrl}/apis/image.openshift.io/v1/namespaces/${ns}/imagestreamtags/${name}:${tag}`,
          ),
      ),
    );
  }
}

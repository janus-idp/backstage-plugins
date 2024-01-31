import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

const DEFAULT_PROXY_PATH = '/openshift-image-registry/api';

export interface OpenshiftImageRegistryApiV1 {
  getImageStreams(ns: string): Promise<any>;
  getAllImageStreams(): Promise<any>;
  getImageStream(ns: string, imageName: string): Promise<any>;
  getImageStreamTags(ns: string, imageName: string): Promise<any>;
  getImageStreamTag(ns: string, imageName: string, tag: string): Promise<any>;
  getNamespaces(): Promise<any>;
}

export const openshiftImageRegistryApiRef =
  createApiRef<OpenshiftImageRegistryApiV1>({
    id: 'plugin.openshift-image-registry.service',
  });

export type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
  identityApi: IdentityApi;
};

export class OpenshiftImageRegistryApiClient
  implements OpenshiftImageRegistryApiV1
{
  // @ts-ignore
  private readonly discoveryApi: DiscoveryApi;

  private readonly configApi: ConfigApi;

  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  private async getBaseUrl() {
    const proxyPath =
      this.configApi.getOptionalString('openshiftImageRegistry.proxyPath') ??
      DEFAULT_PROXY_PATH;
    return `${await this.discoveryApi.getBaseUrl('proxy')}${proxyPath}`;
  }

  private async fetcher(url: string) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
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

  async getAllImageStreams() {
    const proxyUrl = await this.getBaseUrl();
    return (
      await this.fetcher(`${proxyUrl}/apis/image.openshift.io/v1/imagestreams`)
    ).items as any[];
  }

  async getImageStream(ns: string, imageName: string) {
    const proxyUrl = await this.getBaseUrl();
    return await this.fetcher(
      `${proxyUrl}/apis/image.openshift.io/v1/namespaces/${ns}/imagestreams/${imageName}`,
    );
  }

  async getImageStreamTags(ns: string, imageName: string) {
    const imageStream = await this.getImageStream(ns, imageName);
    const allTags = imageStream.status.tags.map((tag: any) => tag.tag);

    const proxyUrl = await this.getBaseUrl();

    return Promise.all(
      allTags.map(
        async (tag: any) =>
          await this.fetcher(
            `${proxyUrl}/apis/image.openshift.io/v1/namespaces/${ns}/imagestreamtags/${imageName}:${tag}`,
          ),
      ),
    );
  }

  async getImageStreamTag(ns: string, imageName: string, tag: string) {
    const proxyUrl = await this.getBaseUrl();
    return await this.fetcher(
      `${proxyUrl}/apis/image.openshift.io/v1/namespaces/${ns}/imagestreamtags/${imageName}:${tag}`,
    );
  }
}

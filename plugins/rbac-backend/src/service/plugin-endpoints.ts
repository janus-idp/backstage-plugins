import {
  FetchUrlReader,
  PluginEndpointDiscovery,
  ReaderFactory,
} from '@backstage/backend-common';

export class PluginEndpointCollector {
  private readonly pluginIds: string[];

  constructor(
    private readonly discovery: PluginEndpointDiscovery,
    private readonly pluginIdProvider: { getPluginIds: () => string[] },
  ) {
    this.pluginIds = this.pluginIdProvider.getPluginIds();
  }

  async get(): Promise<string[]> {
    const endpoints: string[] = [];
    for (const pluginId of this.pluginIds) {
      const endpoint = await this.discovery.getBaseUrl(pluginId);
      endpoints.push(endpoint);
    }
    return endpoints;
  }

  static permissionFactory: ReaderFactory = () => {
    return [{ reader: new FetchUrlReader(), predicate: (_url: URL) => true }];
  };
}

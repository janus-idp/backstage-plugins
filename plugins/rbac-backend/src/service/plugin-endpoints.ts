import {
  FetchUrlReader,
  PluginEndpointDiscovery,
  ReaderFactory,
} from '@backstage/backend-common';

import { BackendPluginIDsProvider } from './backend-plugin-ids-provider';

export class PluginEndpointCollector {
  private readonly pluginIds: string[];

  constructor(private readonly discovery: PluginEndpointDiscovery) {
    this.pluginIds = new BackendPluginIDsProvider().getPluginIds();
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

import { FetchUrlReader, ReaderFactory } from '@backstage/backend-common';

export interface PluginEndpointProvider {
  get(): string[];
}

export class PluginEndpointCollector implements PluginEndpointProvider {
  private readonly endpoints: string[] = [];

  add(endpoint: string): string {
    this.endpoints.push(endpoint);
    return endpoint;
  }

  get(): string[] {
    return this.endpoints;
  }

  static permissionFactory: ReaderFactory = ({}) => {
    return [{ reader: new FetchUrlReader(), predicate: (_url: URL) => true }];
  };
}

import { Entity } from '@backstage/catalog-model';
import { createApiRef, DiscoveryApi } from '@backstage/core-plugin-api';

import {
  DirectionType,
  FetchResponseWrapper,
  KUBERNETES_ANNOTATION,
  KUBERNETES_LABEL_SELECTOR,
  KUBERNETES_NAMESPACE,
} from '@janus-idp/backstage-plugin-kiali-common';

export interface KialiApi {
  get(endpoint: string, query?: Query): Promise<FetchResponseWrapper>;
  setEntity(entity: Entity): void;
}

export const kialiApiRef = createApiRef<KialiApi>({
  id: 'plugin.kiali.service',
});

/**
 * Query Interface
 */

type Query = {
  ns?: string;
  nss?: string[];
  overviewType?: string;
  duration?: number;
  direction?: DirectionType;
};

export const KialiEndpoints = {
  getOverview: 'overview',
  getConfig: 'config',
};

/**
 * Provides A KialiClient class to query backend
 */
export class KialiApiClient implements KialiApi {
  private readonly discoveryApi: DiscoveryApi;
  protected entity: Entity | null;

  constructor(discoveryApi: DiscoveryApi) {
    this.discoveryApi = discoveryApi;
    this.entity = null;
  }

  private async getBaseUrl() {
    return `${await this.discoveryApi.getBaseUrl('kiali')}`;
  }

  setEntity = (entity: Entity) => {
    this.entity = entity;
  };

  private addParam = (key: string, query: URLSearchParams) => {
    const value = this.entity?.metadata.annotations![key];
    if (value) {
      query.append(encodeURIComponent(key), encodeURIComponent(value));
    }
  };

  private getQuery = (q?: Query): string => {
    const queryString = new URLSearchParams();
    if (this.entity?.metadata.annotations) {
      this.addParam(KUBERNETES_ANNOTATION, queryString);
      this.addParam(KUBERNETES_LABEL_SELECTOR, queryString);
      this.addParam(KUBERNETES_NAMESPACE, queryString);
    }
    if (!q) {
      return `?${queryString}`;
    }
    if (q.ns) {
      queryString.append('ns', q.ns);
    }
    if (q.nss) {
      queryString.append('nss', q.nss.join(','));
    }
    if (q.overviewType) {
      queryString.append('overviewType', q.overviewType);
    }
    if (q.duration) {
      queryString.append('duration', q.duration.toString());
    }
    if (q.direction) {
      queryString.append('direction', q.direction.toString());
    }
    return `?${queryString}`;
  };

  private async getAPI(
    endpoint: string,
    q?: Query,
  ): Promise<FetchResponseWrapper> {
    const proxyUrl = await this.getBaseUrl();
    const url = `${proxyUrl}/${endpoint}${this.getQuery(q)}`;
    const jsonResponse = await fetch(url);
    return jsonResponse.json();
  }

  async get(endpoint: string, query?: Query): Promise<FetchResponseWrapper> {
    return this.getAPI(endpoint, query);
  }
}

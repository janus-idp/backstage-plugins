import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';

import {
  DirectionType,
  FetchResponseWrapper,
  OverviewType,
} from '@janus-idp/backstage-plugin-kiali-common';

export interface KialiApi {
  getConfig(): Promise<FetchResponseWrapper>;
  getInfo(): Promise<FetchResponseWrapper>;
  getOverview(
    overviewType: OverviewType,
    duration: number,
    direction: DirectionType,
  ): Promise<FetchResponseWrapper>;
  getNamespaces(): Promise<FetchResponseWrapper>;
  setEntity(entity: Entity): void;
}

export const kialiApiRef = createApiRef<KialiApi>({
  id: 'plugin.kiali.service',
});

export const KialiEndpoints = {
  getInfo: 'info',
  getOverview: 'overview',
  getConfig: 'config',
  getNamespaces: 'namespaces',
};

/**
 * Provides A KialiClient class to query backend
 */
export class KialiApiClient implements KialiApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi: IdentityApi;
  protected entity: Entity | null;

  constructor(options: {
    discoveryApi: DiscoveryApi;
    identityApi: IdentityApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
    this.entity = null;
  }

  setEntity = (entity: Entity) => {
    this.entity = entity;
  };

  private async getAPI(
    endpoint: string,
    requestBody: any,
  ): Promise<FetchResponseWrapper> {
    const url = `${await this.discoveryApi.getBaseUrl('kiali')}/${endpoint}`;
    const { token: idToken } = await this.identityApi.getCredentials();
    const jsonResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
      body: JSON.stringify(requestBody),
    });
    return jsonResponse.json();
  }

  async getInfo(): Promise<FetchResponseWrapper> {
    return this.getAPI(KialiEndpoints.getInfo, {});
  }

  async getNamespaces(): Promise<FetchResponseWrapper> {
    const requestBody = {
      entityRef: this.entity ? stringifyEntityRef(this.entity) : '',
    };
    return this.getAPI(KialiEndpoints.getNamespaces, requestBody);
  }

  async getConfig(): Promise<FetchResponseWrapper> {
    const requestBody = {
      entityRef: this.entity ? stringifyEntityRef(this.entity) : '',
    };
    return this.getAPI(KialiEndpoints.getConfig, requestBody);
  }

  async getOverview(
    overviewType: OverviewType,
    duration: number,
    direction: DirectionType,
  ): Promise<FetchResponseWrapper> {
    const requestBody = {
      entityRef: this.entity ? stringifyEntityRef(this.entity) : '',
      query: {
        duration,
        overviewType,
        direction,
      },
    };
    return this.getAPI(KialiEndpoints.getOverview, requestBody);
  }
}

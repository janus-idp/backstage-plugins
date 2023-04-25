import { ConfigApi, createApiRef } from '@backstage/core-plugin-api';
import { ErrorResponseBody } from '@backstage/errors';
import { Cluster } from '@janus-idp/backstage-plugin-ocm-common';

export interface OcmApiV1 {
  getClusters(): Promise<Cluster[] | ErrorResponseBody>;
  getClusterByName(
    providerId: string,
    name: string,
  ): Promise<Cluster | ErrorResponseBody>;
}

export type Options = {
  configApi: ConfigApi;
};

export const OcmApiRef = createApiRef<OcmApiV1>({
  id: 'plugin.ocm.service',
});

export class OcmApiClient implements OcmApiV1 {
  private readonly configApi: ConfigApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
  }

  private async clusterApiFetchCall(params?: string): Promise<any> {
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/ocm/status${params || ''}`,
    );
    return jsonResponse.json();
  }

  getClusters(): Promise<ErrorResponseBody | Cluster[]> {
    return this.clusterApiFetchCall();
  }
  getClusterByName(
    providerId: string,
    name: string,
  ): Promise<Cluster | ErrorResponseBody> {
    return this.clusterApiFetchCall(`/${providerId}/${name}`);
  }
}

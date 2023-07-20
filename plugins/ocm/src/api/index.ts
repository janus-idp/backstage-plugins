import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';
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
  identityApi: IdentityApi;
};

export const OcmApiRef = createApiRef<OcmApiV1>({
  id: 'plugin.ocm.service',
});

export class OcmApiClient implements OcmApiV1 {
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
  }

  private async clusterApiFetchCall(params?: string): Promise<any> {
    const { token: idToken } = await this.identityApi.getCredentials();
    const backendUrl = this.configApi.getString('backend.baseUrl');
    const jsonResponse = await fetch(
      `${backendUrl}/api/ocm/status${params || ''}`,
      {
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      },
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

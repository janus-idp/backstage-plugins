import { ConfigApi } from '@backstage/core-plugin-api';
import { ErrorResponseBody } from '@backstage/errors';
import { Cluster } from '@janus-idp/backstage-plugin-ocm-common';

const clusterApiFetchCall = async (configApi: ConfigApi, params?: string) => {
  const backendUrl = configApi.getString('backend.baseUrl');
  const jsonResponse = await fetch(
    `${backendUrl}/api/ocm/status${params || ''}`,
  );
  return jsonResponse.json();
};

export const getClusters = async (
  configApi: ConfigApi,
): Promise<Cluster[] | ErrorResponseBody> => clusterApiFetchCall(configApi);

export const getClusterByName = async (
  configApi: ConfigApi,
  providerId: string,
  name: string,
): Promise<Cluster | ErrorResponseBody> =>
  clusterApiFetchCall(configApi, `/${providerId}/${name}`);

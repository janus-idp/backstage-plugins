import { Config } from "@backstage/config";
import { CustomObjectsApi, KubeConfig } from "@kubernetes/client-node"
import { Logger } from 'winston';
import { getHubClusterFromConfig } from "./config";
import http from 'http';

export const getCustomObjectsApi = (clusterConfig: Config, logger: Logger): CustomObjectsApi => {
  const clusterToken = clusterConfig.getOptionalString('serviceAccountToken');
  const kubeConfig = new KubeConfig();

  if (!clusterToken) {
    logger.info('Using default kubernetes config');
    kubeConfig.loadFromDefault();
    return kubeConfig.makeApiClient(CustomObjectsApi);
  }

  logger.info('Loading kubernetes config from config file');
  const cluster = {
    name: clusterConfig.getString('name'),
    server: clusterConfig.getString('url'),
    skipTLSVerify: clusterConfig.getOptionalBoolean('skipTLSVerify') ?? false,
    caData: clusterConfig.getOptionalString('caData'),
  };

  const user = {
    name: 'backstage',
    token: clusterToken,
  };

  const context = {
    name: cluster.name,
    user: user.name,
    cluster: cluster.name,
  };

  kubeConfig.loadFromOptions({
    clusters: [cluster],
    users: [user],
    contexts: [context],
    currentContext: context.name,
  });
  return kubeConfig.makeApiClient(CustomObjectsApi);
}


export const hubApiClient = (config: Config, logger: Logger) => {
  const hubClusterConfig = getHubClusterFromConfig(config)
  return getCustomObjectsApi(hubClusterConfig, logger)
}

const kubeApiResponseHandler = (
  call: Promise<{
    response: http.IncomingMessage;
    body: object;
  }>,
) => {
  return call
    .then(r => {
      return r.body;
    })
    .catch(r => {
      throw Object.assign(new Error(r.body.reason), {
        statusCode: r.body.code,
        name: r.body.reason,
        ...r.body,
      });
    });
};

export const getManagedCluster = (api: CustomObjectsApi, name: string) => {
  return kubeApiResponseHandler(api.getClusterCustomObject(
    'cluster.open-cluster-management.io',
    'v1',
    'managedclusters',
    name,
  ))
}

export const getManagedClusters = (api: CustomObjectsApi) => {
  return kubeApiResponseHandler(api.listClusterCustomObject(
    'cluster.open-cluster-management.io',
    'v1',
    'managedclusters'
  ))
}

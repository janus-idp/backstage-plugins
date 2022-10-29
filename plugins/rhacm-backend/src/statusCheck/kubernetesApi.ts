import { Config } from "@backstage/config";
import { CustomObjectsApi, KubeConfig } from "@kubernetes/client-node"
import { Logger } from 'winston';

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

import { Config } from '@backstage/config';

const CLUSTERS_PATH = 'kubernetes.clusterLocatorMethods';
const HUB_CLUSTER_CONFIG_PATH = 'rhacm.hub';

export const getHubClusterFromConfig = (config: Config) => {
  try {
    config.getString(HUB_CLUSTER_CONFIG_PATH);
  } catch (err) {
    throw new Error(
      `Hub cluster must be specified in config at '${HUB_CLUSTER_CONFIG_PATH}'`,
    );
  }

  const hub = config
    .getConfigArray(CLUSTERS_PATH)
    .flatMap(method => method.getOptionalConfigArray('clusters') || [])
    .find(
      cluster =>
        cluster.getString('name') === config.getString(HUB_CLUSTER_CONFIG_PATH),
    );
  if (!hub) {
    throw new Error('Hub cluster not defined in kubernetes config');
  }
  return hub;
};

export const getHubClusterName = (config: Config) =>
  config.getString(HUB_CLUSTER_CONFIG_PATH);

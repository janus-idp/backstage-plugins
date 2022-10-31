import { Config } from '@backstage/config';

const CLUSTERS_PATH = 'kubernetes.clusterLocatorMethods';
const HUB_CLUSTER_CONFIG_PATH = 'rhacm.hub';

export const getClustersFromConfig = (config: Config): Config[] => {
  const clusters = config
    .getConfigArray(CLUSTERS_PATH)
    .flatMap(v =>
      v.getString('type') !== 'config' ? [] : v.getConfigArray('clusters'),
    );
  return clusters;
};

export const getHubClusterFromConfig = (config: Config) => {
  const hub = config
    .getConfigArray(CLUSTERS_PATH)
    .find(method =>
      method
        .getConfigArray('clusters')
        .find(
          cluster =>
            cluster.getString('name') ===
            config.getString(HUB_CLUSTER_CONFIG_PATH),
        ),
    );
  if (!hub) {
    throw new Error('Hub cluster not defined in kubernetes config');
  }
  return hub;
};

export const getHubClusterName = (config: Config) =>
  config.getString(HUB_CLUSTER_CONFIG_PATH);

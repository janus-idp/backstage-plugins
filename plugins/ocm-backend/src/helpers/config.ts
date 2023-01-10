import { Config } from '@backstage/config';
import { Logger } from 'winston';

const CLUSTERS_PATH = 'kubernetes.clusterLocatorMethods';
const OCM_PREFIX = 'ocm';
const CLUSTER_CONFIG_PATH = `${OCM_PREFIX}.cluster`;
const HUB_CONFIG_PATH = `${OCM_PREFIX}.hub`;

export const getConfigVariantPath = (config: Config): string => {
  const hubConfig = config.has(HUB_CONFIG_PATH);

  if (!hubConfig && !config.has(CLUSTER_CONFIG_PATH)) {
    throw new Error(
      `Neither hub or cluster configuration were specified at '${OCM_PREFIX}.' config`,
    );
  }

  return hubConfig ? HUB_CONFIG_PATH : CLUSTER_CONFIG_PATH;
};

export const getHubClusterName = (config: Config): string => {
  const path = `${getConfigVariantPath(config)}.name`;
  try {
    return config.getString(path);
  } catch (err) {
    throw new Error(`'${path}' must be specified in hub config`);
  }
};

export const getHubClusterFromKubernetesConfig = (config: Config): Config => {
  const hub = config
    .getConfigArray(CLUSTERS_PATH)
    .flatMap(method => method.getOptionalConfigArray('clusters') || [])
    .find(
      cluster =>
        cluster.getString('name') ===
        config.getOptionalString(`${CLUSTER_CONFIG_PATH}.name`),
    );
  if (!hub) {
    throw new Error('Hub cluster not defined in kubernetes config');
  }
  return hub;
};

export const getHubClusterFromOcmConfig = (config: Config): Config => {
  const hub = config.getConfig(HUB_CONFIG_PATH);
  // Check if required values are valid
  const requiredValues = ['name', 'url'];
  requiredValues.forEach(key => {
    if (!config.has(`${HUB_CONFIG_PATH}.${key}`)) {
      throw new Error(
        `Hub cluster ${key} must be specified in config at '${HUB_CONFIG_PATH}.${key}'`,
      );
    }
  });
  return hub;
};

export const getHubClusterFromConfig = (
  config: Config,
  logger: Logger,
): Config => {
  // If no configuration is found an error is thrown
  const path = getConfigVariantPath(config);

  if (path === HUB_CONFIG_PATH) {
    logger.info(`Loading config from ${HUB_CONFIG_PATH} config`);
    return getHubClusterFromOcmConfig(config);
  }
  if (path === CLUSTER_CONFIG_PATH) {
    logger.info(`Loading config from ${CLUSTER_CONFIG_PATH} config`);
    return getHubClusterFromKubernetesConfig(config);
  }

  throw new Error(
    'An unknown error occurred while getting the OCM configuration',
  );
};

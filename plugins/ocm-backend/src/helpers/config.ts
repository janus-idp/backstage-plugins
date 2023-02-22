import { Config } from '@backstage/config';
import { OcmConfig } from '../types';

const KUBERNETES_PLUGIN_CONFIG = 'kubernetes.clusterLocatorMethods';
const OCM_PREFIX = 'catalog.providers.ocm';
const KUBERNETES_PLUGIN_KEY = 'kubernetesPluginRef';

export const deferToKubernetesPlugin = (config: Config): boolean => {
  if (config.has(KUBERNETES_PLUGIN_KEY)) {
    return true;
  }
  return false;
};

export const getHubClusterFromKubernetesConfig = (
  id: string,
  config: Config,
  globalConfig: Config,
): Config => {
  const name = config.getOptionalString(KUBERNETES_PLUGIN_KEY);
  const _logTemplate = `Hub cluster ${OCM_PREFIX}.${id}.${KUBERNETES_PLUGIN_KEY}=${name}`;

  const hub = globalConfig
    .getConfigArray(KUBERNETES_PLUGIN_CONFIG)
    .flatMap(method => method.getOptionalConfigArray('clusters') || [])
    .find(cluster => cluster.getString('name') === name);
  if (!hub) {
    throw new Error(
      `${_logTemplate} not defined in kubernetes in ${KUBERNETES_PLUGIN_CONFIG}.clusters`,
    );
  }

  if (hub.getString('authProvider') !== 'serviceAccount') {
    throw new Error(`${_logTemplate} has to authenticate via 'serviceAccount'`);
  }
  return hub;
};

export const getHubClusterFromOcmConfig = (
  id: string,
  config: Config,
): Config => {
  // Check if required values are valid
  const requiredValues = ['name', 'url'];
  requiredValues.forEach(key => {
    if (!config.has(key)) {
      throw new Error(
        `Value must be specified in config at '${OCM_PREFIX}.${id}.${key}'`,
      );
    }
  });
  return config;
};

export const getHubClusterFromConfig = (
  id: string,
  config: Config,
  globalConfig: Config,
): OcmConfig => {
  const hub = deferToKubernetesPlugin(config)
    ? getHubClusterFromKubernetesConfig(id, config, globalConfig)
    : getHubClusterFromOcmConfig(id, config);

  return {
    id,
    url: hub.getString('url'),
    hubResourceName: hub.getString('name'),
    serviceAccountToken: hub.getOptionalString('serviceAccountToken'),
    skipTLSVerify: hub.getOptionalBoolean('skipTLSVerify') || false,
    caData: hub.getOptionalString('caData'),
  };
};

export const readOcmConfigs = (config: Config): OcmConfig[] => {
  const ocmConfigs = config.getOptionalConfig(OCM_PREFIX);

  if (!ocmConfigs) {
    return [];
  }

  return ocmConfigs
    .keys()
    .map(id => getHubClusterFromConfig(id, ocmConfigs.getConfig(id), config));
};

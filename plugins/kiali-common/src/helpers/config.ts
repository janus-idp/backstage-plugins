import { Config } from '@backstage/config';

import { KialiDetails } from '../types';

const KIALI_PREFIX = 'catalog.providers.kiali';

const isValidUrl = (url: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (error) {
    return false;
  }
  return true;
};

export const getFromKialiConfig = (config: Config): Config => {
  // Check if required values are valid
  const requiredValues = ['url'];
  requiredValues.forEach(key => {
    if (!config.has(key)) {
      throw new Error(
        `Value must be specified in config at '${KIALI_PREFIX}.${key}'`,
      );
    }
  });
  return config;
};
export const getHubClusterFromConfig = (config: Config): KialiDetails => {
  const hub = getFromKialiConfig(config);

  const url = hub.getString('url');
  if (!isValidUrl(url)) {
    throw new Error(`"${url}" is not a valid url`);
  }

  return {
    url,
    strategy: hub.getString('strategy'),
    serviceAccountToken: hub.getOptionalString('serviceAccountToken'),
    skipTLSVerify: hub.getOptionalBoolean('skipTLSVerify') || false,
    caData: hub.getOptionalString('caData'),
    caFile: hub.getOptionalString('caFile'),
    sessionTime: hub.getOptionalNumber('sessionTime'),
  };
};

export const readKialiConfigs = (config: Config): KialiDetails => {
  const kialiConfigs = config.getConfig(KIALI_PREFIX);
  return getHubClusterFromConfig(kialiConfigs);
};

import { ConfigReader } from '@backstage/config';
import { createLogger, transports } from 'winston';
import {
  getHubClusterFromKubernetesConfig,
  getHubClusterFromConfig,
  getHubClusterName,
  getHubClusterFromOcmConfig,
  getConfigVariantPath,
} from './config';

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

const createConfigParseResult = (data: object, prefix: string) => ({
  data: data,
  context: 'mock-config',
  prefix: prefix,
  fallback: undefined,
  filteredKeys: undefined,
  notifiedFilteredKeys: new Set(),
});

describe('getConfigVariantPath', () => {
  it('should only get the hub config path if the cluster config is also present', () => {
    const config = new ConfigReader({
      ocm: {
        cluster: {},
        hub: {},
      },
    });

    const result = getConfigVariantPath(config);

    expect(result).toEqual('ocm.hub');
  });

  it('should get the cluster config path if its the only one configured', () => {
    const config = new ConfigReader({
      ocm: {
        cluster: {},
      },
    });

    const result = getConfigVariantPath(config);

    expect(result).toEqual('ocm');
  });

  it('should throw if neither cluster or hub are configured', () => {
    const config = new ConfigReader({});

    const result = () => getConfigVariantPath(config);

    expect(result).toThrow(
      "Neither hub or cluster configuration were specified at 'ocm.' config",
    );
  });
});

describe('getHubClusterName', () => {
  it('should get the hub cluster name from ocm cluster config', () => {
    const config = new ConfigReader({
      ocm: {
        cluster: 'cluster2',
      },
    });

    const result = getHubClusterName(config);

    expect(result).toBe('cluster2');
  });

  it('should get the hub cluster name from ocm hub config', () => {
    const config = new ConfigReader({
      ocm: {
        hub: {
          name: 'cluster2',
        },
      },
    });

    const result = getHubClusterName(config);

    expect(result).toBe('cluster2');
  });

  it('should throw an error if neither hub or cluster are configured', () => {
    const config = new ConfigReader({});

    const result = () => getHubClusterName(config);

    expect(result).toThrow(
      "Neither hub or cluster configuration were specified at 'ocm.' config",
    );
  });

  it('should throw an error if name is not configured', () => {
    const config = new ConfigReader({
      ocm: {
        hub: {
          url: 'http://example.com',
        },
      },
    });

    const result = () => getHubClusterName(config);

    expect(result).toThrow(
      "'ocm.hub.name' or 'ocm.cluster' must be specified in ocm config",
    );
  });
});

describe('getHubClusterFromKubernetesConfig', () => {
  it('should get the correct hub cluster from multiple configured clusters', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster1',
              },
              {
                name: 'cluster2',
              },
              {
                name: 'cluster3',
              },
            ],
          },
        ],
      },
      ocm: {
        cluster: 'cluster2',
      },
    });

    const result = getHubClusterFromKubernetesConfig(config);

    expect(result).toEqual(
      createConfigParseResult(
        {
          name: 'cluster2',
        },
        'kubernetes.clusterLocatorMethods[0].clusters[1]',
      ),
    );
  });

  it('should throw an error when the hub cluster is not found in kubernetes config', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster4',
              },
            ],
          },
        ],
      },
      ocm: {
        cluster: 'cluster2',
      },
    });

    const result = () => getHubClusterFromKubernetesConfig(config);

    expect(result).toThrow('Hub cluster not defined in kubernetes config');
  });

  it('should throw an error when there are no cluster configured', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
          },
        ],
      },
      ocm: {
        cluster: {
          name: 'cluster2',
        },
      },
    });

    const result = () => {
      getHubClusterFromKubernetesConfig(config);
    };

    expect(result).toThrow('Hub cluster not defined in kubernetes config');
  });

  it('should throw an error when there is no kubernetes config', () => {
    const config = new ConfigReader({
      ocm: {
        cluster: {
          name: 'cluster2',
        },
      },
    });

    const result = () => getHubClusterFromKubernetesConfig(config);

    expect(result).toThrow(
      "Missing required config value at 'kubernetes.clusterLocatorMethods'",
    );
  });

  it('should throw an error when there is no ocm cluster name configured', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
          },
        ],
      },
      ocm: {
        cluster: {
          key: 'value',
        },
      },
    });

    const result = () => getHubClusterFromKubernetesConfig(config);

    expect(result).toThrow('Hub cluster not defined in kubernetes config');
  });
});

describe('getHubClusterFromOcmConfig', () => {
  it('should correctly return an ocm hub config', () => {
    const config = new ConfigReader({
      ocm: {
        hub: {
          name: 'cluster2',
          url: 'http://example.com',
        },
      },
    });

    const result = getHubClusterFromOcmConfig(config);

    expect(result).toEqual(
      createConfigParseResult(
        {
          name: 'cluster2',
          url: 'http://example.com',
        },
        'ocm.hub',
      ),
    );
  });

  it("should throw an error when url isn't specified in the hub config", () => {
    const config = new ConfigReader({
      ocm: {
        hub: {
          name: 'cluster2',
        },
      },
    });

    const result = () => getHubClusterFromOcmConfig(config);

    expect(result).toThrow(
      "Hub cluster url must be specified in config at 'ocm.hub.url'",
    );
  });

  it("should throw an error when name isn't specified in the hub config", () => {
    const config = new ConfigReader({
      ocm: {
        hub: {
          url: 'http://example.com',
        },
      },
    });

    const result = () => getHubClusterFromOcmConfig(config);

    expect(result).toThrow(
      "Hub cluster name must be specified in config at 'ocm.hub.name'",
    );
  });
});

describe('getHubClusterFromConfig', () => {
  it('should parse only the hub config if the kubernetes config is also present', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster1',
              },
            ],
          },
        ],
      },
      ocm: {
        hub: {
          url: 'https://example.com',
          name: 'cluster2',
        },
      },
    });

    const result = getHubClusterFromConfig(config, logger);

    expect(result).toEqual(
      createConfigParseResult(
        { url: 'https://example.com', name: 'cluster2' },
        'ocm.hub',
      ),
    );
  });

  it('should parse the ocm cluster config and get the correct kubernetes cluster configuration', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster1',
              },
              {
                name: 'cluster2',
              },
            ],
          },
        ],
      },
      ocm: {
        cluster: 'cluster1',
      },
    });

    const result = getHubClusterFromConfig(config, logger);

    expect(result).toEqual(
      createConfigParseResult(
        { name: 'cluster1' },
        'kubernetes.clusterLocatorMethods[0].clusters[0]',
      ),
    );
  });

  it('should prefer the hub configuration over the cluster configuration', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster3',
              },
              {
                name: 'cluster2',
              },
            ],
          },
        ],
      },
      ocm: {
        cluster: {
          name: 'cluster3',
        },
        hub: {
          url: 'https://example.com',
          name: 'cluster1',
        },
      },
    });

    const result = getHubClusterFromConfig(config, logger);

    expect(result).toEqual(
      createConfigParseResult(
        { url: 'https://example.com', name: 'cluster1' },
        'ocm.hub',
      ),
    );
  });
});

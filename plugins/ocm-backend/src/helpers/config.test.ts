import { ConfigReader } from '@backstage/config';
import { getHubClusterFromConfig } from './config';

const createConfig = (clusters: any[]) => ({
  kubernetes: {
    clusterLocatorMethods: [
      {
        type: 'config',
        clusters: clusters,
      },
    ],
  },
  ocm: {
    hub: 'cluster2',
  },
});

const createConfigParseResult = (name: string) => ({
  data: { name: name },
  context: 'mock-config',
  prefix: 'kubernetes.clusterLocatorMethods[0].clusters[1]',
  fallback: undefined,
  filteredKeys: undefined,
  notifiedFilteredKeys: new Set(),
});

describe('getHubClusterFromConfig', () => {
  it('should get the correct hub cluster from multiple configured clusters', () => {
    const config = new ConfigReader(
      createConfig([
        {
          name: 'cluster1',
        },
        {
          name: 'cluster2',
        },
        {
          name: 'cluster3',
        },
      ]),
    );

    const result = getHubClusterFromConfig(config);

    expect(result).toEqual(createConfigParseResult('cluster2'));
  });

  it('should throw an error when the hub cluster is not found', () => {
    const config = new ConfigReader(
      createConfig([
        {
          name: 'cluster4',
        },
      ]),
    );

    const result = () => getHubClusterFromConfig(config);

    expect(result).toThrow('Hub cluster not defined in kubernetes config');
  });

  it('should throw an error when there are no cluster configured', () => {
    const config = new ConfigReader(createConfig([]));

    const result = () => {
      getHubClusterFromConfig(config);
    };

    expect(result).toThrow('Hub cluster not defined in kubernetes config');
  });

  it('should throw an error when locator methods are empty', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [],
      },
      ocm: {
        hub: 'cluster2',
      },
    });

    const result = () => getHubClusterFromConfig(config);

    expect(result).toThrow('Hub cluster not defined in kubernetes config');
  });

  it('should throw an error when there is to hub cluster configured', () => {
    const config = new ConfigReader({});

    const result = () => getHubClusterFromConfig(config);

    expect(result).toThrow(
      "Hub cluster must be specified in config at 'ocm.hub'",
    );
  });
});

describe('getHubClusterName', () => {
  it('should get the hub cluster name from config', () => {
    const config = new ConfigReader({
      ocm: {
        hub: 'cluster2',
      },
    });

    const result = config.getString('ocm.hub');

    expect(result).toBe('cluster2');
  });
});

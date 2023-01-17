import { ClusterDetails } from '@janus-idp/backstage-plugin-ocm-common';
import {
  getClaim,
  parseManagedCluster,
  parseResources,
  parseUpdateInfo,
} from './parser';

describe('getClaim', () => {
  it('should extract a cluster claim value from a cluster object', () => {
    const cluster = {
      status: {
        clusterClaims: [
          {
            name: 'claim1',
            value: 'claim1_value',
          },
          {
            name: 'claim2',
            value: 'claim2_value',
          },
          {
            name: 'claim3',
            value: 'claim3_value',
          },
        ],
      },
    };

    expect(getClaim(cluster, 'claim2')).toStrictEqual('claim2_value');
  });

  it("should return undefined when cluster claim doesn't exist", () => {
    const cluster: any = {
      status: {
        clusterClaims: [
          {
            name: 'claim1',
            value: 'claim1_value',
          },
          {
            name: 'claim3',
            value: 'claim3_value',
          },
        ],
      },
    };

    const result = getClaim(cluster, 'claim2');

    expect(result).toBeUndefined();
  });
});

describe('parseResources', () => {
  it('should parse resources correctly', () => {
    const resources = {
      cpu: '94500m',
      memory: '656645580Ki',
      pods: '750',
    };

    const expected = {
      cpuCores: 94.5,
      memorySize: '656645580Ki',
      numberOfPods: 750,
    };

    expect(parseResources(resources)).toStrictEqual(expected);
  });

  it('should parse resources even if some resource types are unavailable', () => {
    const resources = {
      cpu: '94500m',
      memory: '656645580Ki',
    };

    const expected = {
      cpuCores: 94.5,
      memorySize: '656645580Ki',
      numberOfPods: undefined,
    };

    expect(parseResources(resources)).toStrictEqual(expected);
  });
});

describe('parseManagedCluster', () => {
  it('should parse a managed cluster to cluster details', () => {
    const cluster = {
      metadata: {
        name: 'cluster1',
        labels: {
          clusterID: '24ee1f0a-c8ac-4833-83ac-dccec690825c',
          openshiftVersion: '4.9.5',
        },
      },
      status: {
        allocatable: {
          cpu: '94500m',
          memory: '656645580Ki',
          pods: '750',
        },
        capacity: {
          cpu: '96',
          memory: '660098508Ki',
          pods: '750',
        },
        clusterClaims: [
          {
            name: 'version.openshift.io',
            value: '4.9.5',
          },
          {
            name: 'id.openshift.io',
            value: '24ee1f0a-c8ac-4833-83ac-dccec690825c',
          },
          {
            name: 'kubeversion.open-cluster-management.io',
            value: 'v1.22.0-rc.0+a44d0f0',
          },
          {
            name: 'platform.open-cluster-management.io',
            value: 'BareMetal',
          },
          {
            name: 'product.open-cluster-management.io',
            value: 'OpenShift',
          },
          {
            name: 'consoleurl.cluster.open-cluster-management.io',
            value: 'https://console.cluster.1cloud',
          },
          {
            name: 'region.open-cluster-management.io',
            value: 'eu',
          },
          {
            name: 'oauthredirecturis.openshift.io',
            value: 'https://oauth.cluster1.cloud',
          },
        ],
        conditions: [
          {
            message: 'Managed cluster is available',
            status: 'True',
            type: 'ManagedClusterConditionAvailable',
          },
        ],
      },
    };

    const result = parseManagedCluster(cluster);

    const expected: ClusterDetails = {
      allocatableResources: {
        cpuCores: 94.5,
        memorySize: '656645580Ki',
        numberOfPods: 750,
      },
      availableResources: {
        cpuCores: 96,
        memorySize: '660098508Ki',
        numberOfPods: 750,
      },
      consoleUrl: 'https://console.cluster.1cloud',
      kubernetesVersion: 'v1.22.0-rc.0+a44d0f0',
      name: 'cluster1',
      oauthUrl: 'https://oauth.cluster1.cloud',
      openshiftId: '24ee1f0a-c8ac-4833-83ac-dccec690825c',
      openshiftVersion: '4.9.5',
      platform: 'BareMetal',
      region: 'eu',
      status: {
        available: true,
        reason: 'Managed cluster is available',
      },
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse a managed cluster without labels to cluster details', () => {
    const cluster = {
      metadata: {},
      status: {
        clusterClaims: [
          {
            name: 'version.openshift.io',
            value: '4.9.5',
          },
          {
            name: 'id.openshift.io',
            value: '24ee1f0a-c8ac-4833-83ac-dccec690825c',
          },
        ],
        conditions: [
          {
            message: 'Managed cluster is available',
            status: 'True',
            type: 'ManagedClusterConditionAvailable',
          },
        ],
      },
    };

    const result = parseManagedCluster(cluster);

    const expected: ClusterDetails = {
      allocatableResources: {
        cpuCores: undefined,
        memorySize: undefined,
        numberOfPods: undefined,
      },
      availableResources: {
        cpuCores: undefined,
        memorySize: undefined,
        numberOfPods: undefined,
      },
      consoleUrl: undefined,
      kubernetesVersion: undefined,
      name: undefined,
      oauthUrl: undefined,
      openshiftId: '24ee1f0a-c8ac-4833-83ac-dccec690825c',
      openshiftVersion: '4.9.5',
      platform: undefined,
      region: undefined,
      status: {
        available: true,
        reason: 'Managed cluster is available',
      },
    };

    expect(result).toStrictEqual(expected);
  });

  it('should parse an unavaliable managed cluster to cluster details', () => {
    const cluster = {
      metadata: {},
      status: {
        clusterClaims: [],
        conditions: [
          {
            message: 'Managed cluster is unavailable',
            status: 'False',
            type: 'ManagedClusterConditionAvailable',
          },
        ],
      },
    };

    const result = parseManagedCluster(cluster);

    const expected: ClusterDetails = {
      allocatableResources: {
        cpuCores: undefined,
        memorySize: undefined,
        numberOfPods: undefined,
      },
      availableResources: {
        cpuCores: undefined,
        memorySize: undefined,
        numberOfPods: undefined,
      },
      consoleUrl: undefined,
      kubernetesVersion: undefined,
      name: undefined,
      oauthUrl: undefined,
      openshiftId: undefined,
      openshiftVersion: undefined,
      platform: undefined,
      region: undefined,
      status: {
        available: false,
        reason: 'Managed cluster is unavailable',
      },
    };

    expect(result).toStrictEqual(expected);
  });
});

describe('parseUpdateInfo', () => {
  it('should correctly parse update information from ClusterInfo', () => {
    const clusterInfo = {
      metadata: {},
      status: {
        distributionInfo: {
          ocp: {
            availableUpdates: ['1.0.1', '1.0.2', '1.0.3', '1.0.0'],
            versionAvailableUpdates: [
              {
                url: 'http://exampleone.com',
                version: '1.0.1',
              },
              {
                url: 'http://exampletwo.com',
                version: '1.0.2',
              },
              {
                url: 'http://examplethree.com',
                version: '1.0.3',
              },
              {
                url: 'http://examplezero.com',
                version: '1.0.0',
              },
            ],
          },
        },
      },
    };

    const result = parseUpdateInfo(clusterInfo);

    expect(result).toEqual({
      update: {
        available: true,
        version: '1.0.3',
        url: 'http://examplethree.com',
      },
    });
  });

  it('should correctly parse while there are no updates available with no arrays', () => {
    const clusterInfo = {
      metadata: {},
      status: {
        distributionInfo: {
          ocp: {},
        },
      },
    };

    const result = parseUpdateInfo(clusterInfo);

    expect(result).toEqual({
      update: {
        available: false,
      },
    });
  });

  it('should correctly parse while there are no updates available with empty arrays', () => {
    const clusterInfo = {
      metadata: {},
      status: {
        distributionInfo: {
          ocp: {
            availableUpdates: [],
            versionAvailableUpdates: [],
          },
        },
      },
    };

    const result = parseUpdateInfo(clusterInfo);

    expect(result).toEqual({
      update: {
        available: false,
      },
    });
  });

  it('should correctly parse while there is only one update available', () => {
    const clusterInfo = {
      metadata: {},
      status: {
        distributionInfo: {
          ocp: {
            availableUpdates: ['1.0.1'],
            versionAvailableUpdates: [
              {
                url: 'http://exampleone.com',
                version: '1.0.1',
              },
            ],
          },
        },
      },
    };

    const result = parseUpdateInfo(clusterInfo);

    expect(result).toEqual({
      update: {
        available: true,
        version: '1.0.1',
        url: 'http://exampleone.com',
      },
    });
  });
});

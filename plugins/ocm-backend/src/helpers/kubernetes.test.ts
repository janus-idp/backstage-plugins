import { ConfigReader } from '@backstage/config';
import {
  getCustomObjectsApi,
  hubApiClient,
  getManagedCluster,
  getManagedClusters,
  getManagedClustersInfo,
} from './kubernetes';
import { createLogger } from 'winston';
import transports from 'winston/lib/winston/transports';
import { CustomObjectsApi, KubeConfig } from '@kubernetes/client-node';
import nock from 'nock';

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('getCustomObjectsApi', () => {
  it('should use the default config if there is no service account token configured', () => {
    process.env.KUBECONFIG = `${__dirname}/test_data/kubeconfig.yaml`;
    const clusterConfig = new ConfigReader({
      name: 'cluster1',
    });

    const result = getCustomObjectsApi(clusterConfig, logger);

    expect(result.basePath).toBe('http://example.com');
    // These fields aren't on the type but are there
    const auth = (result as any).authentications.default;
    expect(auth.clusters[0].name).toBe('default-cluster');
    expect(auth.users[0].token).toBeUndefined();
  });

  it('should use the provided config in the returned api client', () => {
    const clusterConfig = new ConfigReader({
      name: 'cluster1',
      serviceAccountToken: 'TOKEN',
      url: 'http://cluster.com',
    });

    const result = getCustomObjectsApi(clusterConfig, logger);

    expect(result.basePath).toBe('http://cluster.com');
    // These fields aren't on the type but are there
    const auth = (result as any).authentications.default;
    expect(auth.clusters[0].name).toBe('cluster1');
    expect(auth.users[0].token).toBe('TOKEN');
  });
});

describe('hubApiClient', () => {
  it('should return an api client configured with the hub cluster', () => {
    const config = new ConfigReader({
      kubernetes: {
        clusterLocatorMethods: [
          {
            type: 'config',
            clusters: [
              {
                name: 'cluster2',
                serviceAccountToken: 'TOKEN',
                url: 'http://cluster2.com',
              },
            ],
          },
        ],
      },
      ocm: {
        hub: 'cluster2',
      },
    });

    const result = hubApiClient(config, logger);

    expect(result.basePath).toBe('http://cluster2.com');
    // These fields aren't on the type but are there
    const auth = (result as any).authentications.default;
    expect(auth.clusters[0].name).toBe('cluster2');
  });
});

const kubeConfig = {
  clusters: [{ name: 'cluster', server: 'https://127.0.0.1:51010' }],
  users: [{ name: 'user', password: 'password' }],
  contexts: [{ name: 'currentContext', cluster: 'cluster', user: 'user' }],
  currentContext: 'currentContext',
};

const getApi = () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kubeConfig);
  return kc.makeApiClient(CustomObjectsApi);
};

describe('getManagedClusters', () => {
  it('should return some clusters', async () => {
    nock(kubeConfig.clusters[0].server)
      .get('/apis/cluster.open-cluster-management.io/v1/managedclusters')
      .reply(200, {
        body: {
          items: [
            {
              kind: 'ManagedCluster',
              metadata: {
                name: 'cluster1',
              },
            },
            {
              kind: 'ManagedCluster',
              metadata: {
                name: 'cluster2',
              },
            },
          ],
        },
      });

    const result: any = await getManagedClusters(getApi());
    expect(result.body.items[0].metadata.name).toBe('cluster1');
    expect(result.body.items[1].metadata.name).toBe('cluster2');
  });
});

describe('getManagedCluster', () => {
  it('should return the correct cluster', async () => {
    nock(kubeConfig.clusters[0].server)
      .get(
        '/apis/cluster.open-cluster-management.io/v1/managedclusters/cluster1',
      )
      .reply(200, {
        body: {
          metadata: {
            name: 'cluster1',
          },
        },
      });
    nock(kubeConfig.clusters[0].server)
      .get(
        '/apis/cluster.open-cluster-management.io/v1/managedclusters/cluster2',
      )
      .reply(200, {
        body: {
          metadata: {
            name: 'cluster2',
          },
        },
      });

    const result: any = await getManagedCluster(getApi(), 'cluster1');

    expect(result.body.metadata.name).toBe('cluster1');
  });

  it('should return an error object when cluster is not found', async () => {
    const errorResponse = {
      kind: 'Status',
      apiVersion: 'v1',
      metadata: {},
      status: 'Failure',
      message:
        'managedclusters.cluster.open-cluster-management.io "wrong_cluster" not found',
      reason: 'NotFound',
      code: 404,
    };

    nock(kubeConfig.clusters[0].server)
      .get(
        '/apis/cluster.open-cluster-management.io/v1/managedclusters/wrong_cluster',
      )
      .reply(404, errorResponse);

    const result = await getManagedCluster(getApi(), 'wrong_cluster').catch(
      r => r,
    );

    expect(result.statusCode).toBe(404);
    expect(result.name).toBe('NotFound');
  });
});

describe('getManagedClustersInfo', () => {
  it('should return some clusters', async () => {
    nock(kubeConfig.clusters[0].server)
      .get(
        '/apis/internal.open-cluster-management.io/v1beta1/managedclusterinfos',
      )
      .reply(200, {
        body: {
          items: [
            {
              kind: 'ManagedClusterInfo',
              metadata: {
                name: 'cluster1',
              },
            },
            {
              kind: 'ManagedClusterInfo',
              metadata: {
                name: 'cluster2',
              },
            },
          ],
        },
      });

    const result: any = await getManagedClustersInfo(getApi());
    expect(result.body.items[0].metadata.name).toBe('cluster1');
    expect(result.body.items[1].metadata.name).toBe('cluster2');
  });
});

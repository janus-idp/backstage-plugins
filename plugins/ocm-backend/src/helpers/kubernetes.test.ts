import {
  hubApiClient,
  getManagedCluster,
  listManagedClusters,
  getManagedClusterInfo,
} from './kubernetes';
import { createLogger } from 'winston';
import transports from 'winston/lib/winston/transports';
import { CustomObjectsApi, KubeConfig } from '@kubernetes/client-node';
import nock from 'nock';
import { OcmConfig } from '../types';

const FIXTURES_DIR = `${__dirname}/../../__fixtures__`;
const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('hubApiClient', () => {
  it('should use the default config if there is no service account token configured', () => {
    process.env.KUBECONFIG = `${FIXTURES_DIR}/kubeconfig.yaml`;
    const clusterConfig = {
      id: 'foo',
      hubResourceName: 'cluster1',
    } as OcmConfig;

    const result = hubApiClient(clusterConfig, logger);

    expect(result.basePath).toBe('http://example.com');
    // These fields aren't on the type but are there
    const auth = (result as any).authentications.default;
    expect(auth.clusters[0].name).toBe('default-cluster');
    expect(auth.users[0].token).toBeUndefined();
  });

  it('should use the provided config in the returned api client', () => {
    const clusterConfig = {
      id: 'foo',
      hubResourceName: 'cluster1',
      serviceAccountToken: 'TOKEN',
      url: 'http://cluster.com',
    } as OcmConfig;

    const result = hubApiClient(clusterConfig, logger);

    expect(result.basePath).toBe('http://cluster.com');
    // These fields aren't on the type but are there
    const auth = (result as any).authentications.default;
    expect(auth.clusters[0].name).toBe('cluster1');
    expect(auth.users[0].token).toBe('TOKEN');
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
            require(`${FIXTURES_DIR}/cluster.open-cluster-management.io/managedclusters/cluster1.json`),
            require(`${FIXTURES_DIR}/cluster.open-cluster-management.io/managedclusters/local-cluster.json`),
          ],
        },
      });

    const result: any = await listManagedClusters(getApi());
    expect(result.body.items[0].metadata.name).toBe('cluster1');
    expect(result.body.items[1].metadata.name).toBe('local-cluster');
  });
});

describe('getManagedCluster', () => {
  it('should return the correct cluster', async () => {
    nock(kubeConfig.clusters[0].server)
      .get(
        '/apis/cluster.open-cluster-management.io/v1/managedclusters/cluster1',
      )
      .reply(200, {
        body: require(`${FIXTURES_DIR}/cluster.open-cluster-management.io/managedclusters/cluster1.json`),
      });
    nock(kubeConfig.clusters[0].server)
      .get(
        '/apis/cluster.open-cluster-management.io/v1/managedclusters/local-cluster',
      )
      .reply(200, {
        body: require(`${FIXTURES_DIR}/cluster.open-cluster-management.io/managedclusters/local-cluster.json`),
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

describe('getManagedClusterInfo', () => {
  it('should return cluster', async () => {
    nock(kubeConfig.clusters[0].server)
      .get(
        '/apis/internal.open-cluster-management.io/v1beta1/namespaces/local-cluster/managedclusterinfos/local-cluster',
      )
      .reply(200, {
        body: require(`${FIXTURES_DIR}/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`),
      });

    const result: any = await getManagedClusterInfo(getApi(), 'local-cluster');
    expect(result.body.metadata.name).toBe('local-cluster');
  });
});

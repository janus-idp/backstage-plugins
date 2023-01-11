import { ConfigReader } from '@backstage/config';
import express from 'express';
import nock from 'nock';
import request from 'supertest';
import { createLogger, transports } from 'winston';
import { createRouter } from './router';

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    jest.resetAllMocks();
    const router = await createRouter({
      logger: logger,
      config: new ConfigReader({
        ocm: {
          hub: {
            name: 'hubCluster',
            url: 'https://127.0.0.1:51010',
            serviceAccountToken: 'TOKEN',
          },
        },
      }),
    });
    app = express().use(router);
  });

  describe('GET /status', () => {
    beforeAll(() => {
      nock('https://127.0.0.1:51010')
        .get('/apis/cluster.open-cluster-management.io/v1/managedclusters')
        .reply(200, {
          items: [
            {
              kind: 'ManagedCluster',
              metadata: {
                name: 'cluster1',
              },
              status: {
                clusterClaims: [],
                conditions: [
                  {
                    message: 'Managed cluster is available',
                    status: 'True',
                    type: 'ManagedClusterConditionAvailable',
                  },
                ],
              },
            },
            {
              kind: 'ManagedCluster',
              metadata: {
                name: 'cluster2',
              },
              status: {
                clusterClaims: [],
                conditions: [
                  {
                    message: 'Managed cluster is available',
                    status: 'True',
                    type: 'ManagedClusterConditionAvailable',
                  },
                ],
              },
            },
          ],
        })
        .get(
          '/apis/internal.open-cluster-management.io/v1beta1/managedclusterinfos',
        )
        .reply(200, {
          items: [
            {
              kind: 'ManagedClusterInfo',
              metadata: {
                name: 'cluster1',
              },
              status: {
                distributionInfo: {
                  ocp: {
                    availableUpdates: ['1.0.1', '1.0.2'],
                    versionAvailableUpdates: [
                      {
                        url: 'http://exampleone.com',
                        version: '1.0.1',
                      },
                      {
                        url: 'http://exampletwo.com',
                        version: '1.0.2',
                      },
                    ],
                  },
                },
              },
            },
            {
              kind: 'ManagedClusterInfo',
              metadata: {
                name: 'cluster2',
              },
              status: {
                distributionInfo: {
                  ocp: {
                    availableUpdates: ['1.0.3', '1.0.4'],
                    versionAvailableUpdates: [
                      {
                        url: 'http://examplethree.com',
                        version: '1.0.3',
                      },
                      {
                        url: 'http://examplefour.com',
                        version: '1.0.4',
                      },
                    ],
                  },
                },
              },
            },
          ],
        })
        .persist();
    });

    afterAll(() => {
      nock.cleanAll();
    });

    it('should get all clusters', async () => {
      const result = await request(app).get('/status');

      expect(result.status).toBe(200);
      expect(result.body).toEqual([
        {
          allocatableResources: {},
          availableResources: {},
          name: 'cluster1',
          status: {
            available: true,
            reason: 'Managed cluster is available',
          },
          update: {
            available: true,
            version: '1.0.2',
            url: 'http://exampletwo.com',
          },
        },
        {
          allocatableResources: {},
          availableResources: {},
          name: 'cluster2',
          status: {
            available: true,
            reason: 'Managed cluster is available',
          },
          update: {
            available: true,
            version: '1.0.4',
            url: 'http://examplefour.com',
          },
        },
      ]);
    });
  });

  describe('GET /status/:clusterName', () => {
    beforeAll(() => {
      nock('https://127.0.0.1:51010')
        .get(
          '/apis/cluster.open-cluster-management.io/v1/managedclusters/local-cluster',
        )
        .reply(200, {
          kind: 'ManagedCluster',
          metadata: {
            name: 'local-cluster',
          },
          status: {
            clusterClaims: [],
            conditions: [
              {
                message: 'Managed cluster is available',
                status: 'True',
                type: 'ManagedClusterConditionAvailable',
              },
            ],
          },
        })
        .get(
          '/apis/cluster.open-cluster-management.io/v1/managedclusters/cluster1',
        )
        .reply(200, {
          kind: 'ManagedCluster',
          metadata: {
            name: 'cluster1',
          },
          status: {
            clusterClaims: [],
            conditions: [
              {
                message: 'Managed cluster is available',
                status: 'True',
                type: 'ManagedClusterConditionAvailable',
              },
            ],
          },
        })
        .get(
          '/apis/cluster.open-cluster-management.io/v1/managedclusters/non_existent_cluster',
        )
        .reply(404, {
          kind: 'Status',
          apiVersion: 'v1',
          metadata: {},
          status: 'Failure',
          message:
            'managedclusters.cluster.open-cluster-management.io "non_existent_cluster" not found',
          reason: 'NotFound',
          details: {
            name: 'non_existent_cluster',
            group: 'cluster.open-cluster-management.io',
            kind: 'managedclusters',
          },
          code: 404,
        })
        .get(
          '/apis/internal.open-cluster-management.io/v1beta1/managedclusterinfos',
        )
        .reply(200, {
          items: [
            {
              kind: 'ManagedClusterInfo',
              metadata: {
                name: 'local-cluster',
              },
              status: {
                distributionInfo: {
                  ocp: {
                    availableUpdates: ['1.0.1', '1.0.2'],
                    versionAvailableUpdates: [
                      {
                        url: 'http://exampleone.com',
                        version: '1.0.1',
                      },
                      {
                        url: 'http://exampletwo.com',
                        version: '1.0.2',
                      },
                    ],
                  },
                },
              },
            },
            {
              kind: 'ManagedClusterInfo',
              metadata: {
                name: 'cluster1',
              },
              status: {
                distributionInfo: {
                  ocp: {
                    availableUpdates: ['1.0.3', '1.0.4'],
                    versionAvailableUpdates: [
                      {
                        url: 'http://examplethree.com',
                        version: '1.0.3',
                      },
                      {
                        url: 'http://examplefour.com',
                        version: '1.0.4',
                      },
                    ],
                  },
                },
              },
            },
          ],
        })
        .persist();
    });

    afterAll(() => {
      nock.cleanAll();
    });

    it('should correctly parse a cluster', async () => {
      const result = await request(app).get('/status/cluster1');

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        allocatableResources: {},
        availableResources: {},
        name: 'cluster1',
        status: {
          available: true,
          reason: 'Managed cluster is available',
        },
        update: {
          available: true,
          version: '1.0.4',
          url: 'http://examplefour.com',
        },
      });
    });
    it('should normalize the cluster name if the queried cluster is the hub', async () => {
      const result = await request(app).get('/status/hubCluster');

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        allocatableResources: {},
        availableResources: {},
        name: 'local-cluster',
        status: {
          available: true,
          reason: 'Managed cluster is available',
        },
        update: {
          available: true,
          version: '1.0.2',
          url: 'http://exampletwo.com',
        },
      });
    });
    it('should correctly parse an error while querying for non existent cluster', async () => {
      const result = await request(app).get('/status/non_existent_cluster');

      expect(result.status).toBe(404);
      expect(result.body).toEqual({
        error: {
          name: 'NotFound',
          message:
            'managedclusters.cluster.open-cluster-management.io "non_existent_cluster" not found',
          statusCode: 404,
          kind: 'Status',
          apiVersion: 'v1',
          metadata: {},
          status: 'Failure',
          reason: 'NotFound',
          details: {
            name: 'non_existent_cluster',
            group: 'cluster.open-cluster-management.io',
            kind: 'managedclusters',
          },
          code: 404,
          level: 'error',
          service: 'backstage',
        },
        request: { method: 'GET', url: '/status/non_existent_cluster' },
        response: { statusCode: 404 },
      });
    });
  });
});

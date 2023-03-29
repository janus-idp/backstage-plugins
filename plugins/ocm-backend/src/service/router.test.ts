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
        catalog: {
          providers: {
            ocm: {
              foo: {
                name: 'thisishub',
                url: 'https://127.0.0.1:51010',
                serviceAccountToken: 'TOKEN',
              },
            },
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
            require(`${__dirname}/../fixtures/cluster.open-cluster-management.io/managedclusters/local-cluster.json`),
            require(`${__dirname}/../fixtures/cluster.open-cluster-management.io/managedclusters/cluster1.json`),
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
          name: 'thisishub',
          status: {
            available: true,
            reason: 'Managed cluster is available',
          },
        },
        {
          name: 'cluster1',
          status: {
            available: true,
            reason: 'Managed cluster is available',
          },
        },
      ]);
    });
  });

  describe('GET /status/:hubName/:clusterName', () => {
    beforeAll(() => {
      nock('https://127.0.0.1:51010')
        .get(
          '/apis/cluster.open-cluster-management.io/v1/managedclusters/local-cluster',
        )
        .reply(
          200,
          require(`${__dirname}/../fixtures/cluster.open-cluster-management.io/managedclusters/local-cluster.json`),
        )
        .get(
          '/apis/cluster.open-cluster-management.io/v1/managedclusters/cluster1',
        )
        .reply(
          200,
          require(`${__dirname}/../fixtures/cluster.open-cluster-management.io/managedclusters/cluster1.json`),
        )
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
          '/apis/internal.open-cluster-management.io/v1beta1/namespaces/cluster1/managedclusterinfos/cluster1',
        )
        .reply(
          200,
          require(`${__dirname}/../fixtures/internal.open-cluster-management.io/managedclusterinfos/cluster1.json`),
        )
        .get(
          '/apis/internal.open-cluster-management.io/v1beta1/namespaces/local-cluster/managedclusterinfos/local-cluster',
        )
        .reply(
          200,
          require(`${__dirname}/../fixtures/internal.open-cluster-management.io/managedclusterinfos/local-cluster.json`),
        )
        .persist();
    });

    afterAll(() => {
      nock.cleanAll();
    });

    it('should correctly parse a cluster', async () => {
      const result = await request(app).get('/status/foo/cluster1');

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        allocatableResources: {
          cpuCores: 1136.5,
          memorySize: '7469511796Ki',
          numberOfPods: 7750,
        },
        availableResources: {
          cpuCores: 1152,
          memorySize: '7505192052Ki',
          numberOfPods: 7750,
        },
        consoleUrl: 'https://console-openshift-console.apps.cluster1.bar.baz',
        kubernetesVersion: 'v1.22.3+fdba464',
        name: 'cluster1',
        oauthUrl:
          'https://oauth-openshift.apps.cluster1.bar.baz/oauth/token/implicit',
        openshiftId: '5d448ae7-05f1-42cc-aacc-3122a8ad0184',
        openshiftVersion: '4.9.21',
        platform: 'BareMetal',
        region: '',
        status: {
          available: true,
          reason: 'Managed cluster is available',
        },
        update: {
          available: true,
          url: 'https://access.redhat.com/errata/RHSA-2023:0561',
          version: '4.10.51',
        },
      });
    });
    it('should normalize the cluster name if the queried cluster is the hub', async () => {
      const result = await request(app).get('/status/foo/thisishub');

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        allocatableResources: {
          cpuCores: 94.5,
          memorySize: '524485752Ki',
          numberOfPods: 750,
        },
        availableResources: {
          cpuCores: 96,
          memorySize: '527938680Ki',
          numberOfPods: 750,
        },
        consoleUrl: 'https://console-openshift-console.apps.foo.bar.baz',
        kubernetesVersion: 'v1.23.5+012e945',
        name: 'thisishub',
        oauthUrl:
          'https://oauth-openshift.apps.foo.bar.baz/oauth/token/implicit',
        openshiftId: '91976abd-8b8e-47b9-82d3-e84793396ed7',
        openshiftVersion: '4.10.26',
        platform: 'BareMetal',
        region: '',
        status: {
          available: true,
          reason: 'Managed cluster is available',
        },
        update: {
          available: true,
          url: 'https://access.redhat.com/errata/RHSA-2023:0561',
          version: '4.10.51',
        },
      });
    });
    it('should correctly parse an error while querying for non existent cluster', async () => {
      const result = await request(app).get('/status/foo/non_existent_cluster');

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
        },
        request: { method: 'GET', url: '/status/foo/non_existent_cluster' },
        response: { statusCode: 404 },
      });
    });
  });
});

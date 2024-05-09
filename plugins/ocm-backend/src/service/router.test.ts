import { ConfigReader } from '@backstage/config';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import express from 'express';
import { setupServer } from 'msw/node';
import request from 'supertest';
import { createLogger, transports } from 'winston';

import { handlers } from '../../__fixtures__/handlers';
import { createRouter } from './router';

const server = setupServer(...handlers);

beforeAll(() =>
  server.listen({
    /*
     *  This is required so that msw doesn't throw
     *  warnings when the express app is requesting an endpoint
     */
    onUnhandledRequest: 'bypass',
  }),
);
afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

const logger = createLogger({
  transports: [new transports.Console({ silent: true })],
});

const mockedAuthorize = jest.fn().mockImplementation(async () => [
  {
    result: AuthorizeResult.ALLOW,
  },
]);

const mockedAuthorizeConditional = jest.fn().mockImplementation(async () => [
  {
    result: AuthorizeResult.ALLOW,
  },
]);

const mockPermissionEvaluator = {
  authorize: mockedAuthorize,
  authorizeConditional: mockedAuthorizeConditional,
};

const mockDiscovery = {
  getBaseUrl: jest.fn(),
  getExternalBaseUrl: jest.fn(),
};

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    jest.clearAllMocks();
    const router = await createRouter({
      logger: logger,
      config: new ConfigReader({
        catalog: {
          providers: {
            ocm: {
              foo: {
                name: 'thisishub',
                url: 'http://localhost:5000',
                serviceAccountToken: 'TOKEN',
              },
            },
          },
        },
      }),
      permissions: mockPermissionEvaluator,
      discovery: mockDiscovery,
    });
    app = express().use(router);
  });

  describe('GET /status', () => {
    it('should deny access when getting all clusters', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).get('/status');

      expect(mockedAuthorize).toHaveBeenCalled();

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: 'Unauthorized',
      });
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
          nodes: [
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
          ],
          openshiftVersion: '4.10.26',
          platform: 'BareMetal',
          update: {
            available: true,
            url: 'https://access.redhat.com/errata/RHSA-2023:0561',
            version: '4.10.51',
          },
        },
        {
          name: 'cluster1',
          status: {
            available: true,
            reason: 'Managed cluster is available',
          },
          nodes: [
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
          ],
          openshiftVersion: '4.9.21',
          platform: 'BareMetal',
          update: {
            available: true,
            url: 'https://access.redhat.com/errata/RHSA-2023:0561',
            version: '4.10.51',
          },
        },
        {
          name: 'offline-cluster',
          status: {
            available: false,
            reason: 'Managed cluster is unavailable',
          },
          nodes: [
            {
              status: 'Unknown',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'Unknown',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
            {
              status: 'True',
              type: 'Ready',
            },
          ],
          openshiftVersion: '4.9.21',
          platform: 'BareMetal',
          update: {
            available: true,
            url: 'https://access.redhat.com/errata/RHSA-2023:0561',
            version: '4.10.51',
          },
        },
      ]);
    });
  });

  describe('GET /status/:hubName/:clusterName', () => {
    it('should deny access when getting all clusters', async () => {
      mockedAuthorize.mockImplementationOnce(async () => [
        { result: AuthorizeResult.DENY },
      ]);

      const result = await request(app).get('/status/foo/cluster1');

      expect(mockedAuthorize).toHaveBeenCalled();

      expect(result.statusCode).toBe(403);
      expect(result.body.error).toEqual({
        name: 'NotAllowedError',
        message: 'Unauthorized',
      });
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

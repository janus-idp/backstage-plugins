import { ConfigReader } from '@backstage/config';

import express from 'express';
import { setupServer } from 'msw/node';
import request from 'supertest';
import { createLogger, transports } from 'winston';

import { readKialiConfigs } from '@janus-idp/backstage-plugin-kiali-common';

import { handlers } from '../../__fixtures__/handlers';
import { KialiApiImpl } from '../clients/KialiAPIConnector';
import { makeRouter } from './router';

const server = setupServer(...handlers);

const kialiURL = 'https://localhost:4000';
const MockConfig = {
  catalog: {
    providers: {
      kiali: {
        url: kialiURL,
        strategy: 'anonymous',
        skipTLSVerify: true,
      },
    },
  },
};

afterEach(() => server.restoreHandlers());
afterAll(() => server.close());

beforeAll(() =>
  server.listen({
    /*
     *  This is required so that msw doesn't throw
     *  warnings when the express app is requesting an endpoint
     */
    onUnhandledRequest: 'bypass',
  }),
);

describe('createRouter', () => {
  let app: express.Express;

  beforeAll(async () => {
    const mockConfig = new ConfigReader(MockConfig, 'kiali');
    const kiali = readKialiConfigs(mockConfig);
    const logger = createLogger({
      transports: [new transports.Console({ silent: true })],
    });
    const kialiAPI = new KialiApiImpl({ logger, kiali });
    app = express();
    app.use(express.json());
    const router = makeRouter(logger, kialiAPI);
    app.use('/', router);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /config', () => {
    it('returns config', async () => {
      const response = await request(app)
        .get('/config')
        .set('Content-Type', 'application/json');

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        warnings: [],
        errors: [],
        response: {
          server: {
            accessibleNamespaces: ['**'],
            authStrategy: 'anonymous',
            clusterInfo: {},
            deployment: {},
            healthConfig: {
              rate: [
                {
                  tolerance: [
                    {
                      code: '5XX',
                      degraded: 0,
                      failure: 10,
                      protocol: 'http',
                      direction: '.*',
                    },
                    {
                      code: '4XX',
                      degraded: 10,
                      failure: 20,
                      protocol: 'http',
                      direction: '.*',
                    },
                    {
                      code: '^[1-9]$|^1[0-6]$',
                      degraded: 0,
                      failure: 10,
                      protocol: 'grpc',
                      direction: '.*',
                    },
                    {
                      code: '^-$',
                      degraded: 0,
                      failure: 10,
                      protocol: 'http|grpc',
                      direction: '.*',
                    },
                  ],
                },
                {
                  tolerance: [
                    {
                      code: '5XX',
                      degraded: 0,
                      failure: 10,
                      protocol: 'http',
                      direction: '.*',
                    },
                    {
                      code: '4XX',
                      degraded: 10,
                      failure: 20,
                      protocol: 'http',
                      direction: '.*',
                    },
                    {
                      code: '^[1-9]$|^1[0-6]$',
                      degraded: 0,
                      failure: 10,
                      protocol: 'grpc',
                      direction: '.*',
                    },
                    {
                      code: '^-$',
                      degraded: 0,
                      failure: 10,
                      protocol: 'http|grpc',
                      direction: '.*',
                    },
                  ],
                },
              ],
            },
            istioAnnotations: {
              istioInjectionAnnotation: 'sidecar.istio.io/inject',
            },
            istioCanaryRevision: {},
            istioStatusEnabled: true,
            istioIdentityDomain: 'svc.cluster.local',
            istioNamespace: 'istio-system',
            istioLabels: {
              appLabelName: 'app',
              injectionLabelName: 'istio-injection',
              injectionLabelRev: 'istio.io/rev',
              versionLabelName: 'version',
            },
            istioConfigMap: 'istio',
            kialiFeatureFlags: {
              certificatesInformationIndicators: {
                enabled: true,
                secrets: ['cacerts', 'istio-ca-secret'],
              },
              clustering: {
                enable_exec_provider: false,
              },
              istioAnnotationAction: true,
              istioInjectionAction: true,
              istioUpgradeAction: false,
              uiDefaults: {
                graph: {
                  findOptions: [
                    {
                      description: 'Find: slow edges (\u003e 1s)',
                      expression: 'rt \u003e 1000',
                    },
                    {
                      description: 'Find: unhealthy nodes',
                      expression: '! healthy',
                    },
                    {
                      description: 'Find: unknown nodes',
                      expression: 'name = unknown',
                    },
                    {
                      description: 'Find: nodes with the 2 top rankings',
                      expression: 'rank \u003c= 2',
                    },
                  ],
                  hideOptions: [
                    {
                      description: 'Hide: healthy nodes',
                      expression: 'healthy',
                    },
                    {
                      description: 'Hide: unknown nodes',
                      expression: 'name = unknown',
                    },
                    {
                      description:
                        'Hide: nodes ranked lower than the 2 top rankings',
                      expression: 'rank \u003e 2',
                    },
                  ],
                  settings: {
                    fontLabel: 13,
                    minFontBadge: 7,
                    minFontLabel: 10,
                  },
                  traffic: {
                    grpc: 'requests',
                    http: 'requests',
                    tcp: 'sent',
                  },
                },
                list: {
                  includeHealth: true,
                  includeIstioResources: true,
                  includeValidations: true,
                  showIncludeToggles: false,
                },
                metricsPerRefresh: '1m',
                metricsInbound: {},
                metricsOutbound: {},
                refreshInterval: '60s',
              },
              validations: {
                ignore: ['KIA1301'],
                SkipWildcardGatewayHosts: false,
              },
            },
            logLevel: 'trace',
            prometheus: {
              globalScrapeInterval: 15,
              storageTsdbRetention: 1296000,
            },
          },
          meshTLSStatus: {
            status: 'MTLS_NOT_ENABLED',
            autoMTLSEnabled: true,
            minTLS: 'N/A',
          },
          username: 'anonymous',
          status: {
            status: {
              'Kiali commit hash': '72a2496cb4ed1545457a68e34fe3e81409b1611d',
              'Kiali container version': 'v1.71.0-SNAPSHOT',
              'Kiali state': 'running',
              'Kiali version': 'v1.71.0-SNAPSHOT',
              'Mesh name': 'Istio',
              'Mesh version': '1.17.1',
            },
            externalServices: [
              {
                name: 'Istio',
                version: '1.17.1',
              },
              {
                name: 'Prometheus',
                version: '2.34.0',
              },
              {
                name: 'Kubernetes',
                version: 'v1.26.3+b404935',
              },
              {
                name: 'Grafana',
              },
              {
                name: 'Jaeger',
              },
            ],
            warningMessages: [],
            istioEnvironment: {
              isMaistra: false,
              istioAPIEnabled: true,
            },
          },
          istioCerts: [
            {
              secretName: 'istio-ca-secret',
              secretNamespace: 'istio-system',
              dnsNames: null,
              issuer: 'O=cluster.local',
              notBefore: '2023-07-10T10:43:24Z',
              notAfter: '2033-07-07T10:43:24Z',
              error: '',
              accessible: true,
            },
          ],
          kialiConsole: kialiURL,
        },
      });
    });
  });
});

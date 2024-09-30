/*
 * Copyright 2024 The Janus IDP Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  createServiceFactory,
  type BackendFeature,
} from '@backstage/backend-plugin-api';
import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import type {
  CatalogClient,
  CatalogRequestOptions,
  QueryEntitiesRequest,
  QueryEntitiesResponse,
} from '@backstage/catalog-client';
import { catalogServiceRef } from '@backstage/plugin-catalog-node/alpha';
import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import request from 'supertest';

import * as crypto from 'crypto';

import {
  DEFAULT_TEST_HANDLERS,
  loadTestFixture,
  LOCAL_ADDR,
} from '../../__fixtures__/handlers';
import { bulkImportPlugin } from '../plugin';

const BASE_CONFIG = {
  app: {
    baseUrl: 'https://my-backstage-app.example.com',
  },
  integrations: {
    github: [
      {
        host: 'github.com',
        apiBaseUrl: LOCAL_ADDR,
        rawBaseUrl: `${LOCAL_ADDR}/raw`,
        token: 'my_super_secret_gh_token', // notsecret
      },
      {
        host: 'enterprise.github.com',
        apiBaseUrl: LOCAL_ADDR,
        rawBaseUrl: `${LOCAL_ADDR}/raw`,
        apps: [
          {
            appId: 1234567890,
            clientId: 'my-client-id', // notsecret
            clientSecret: 'my-client-secret', // notsecret
            webhookSecret: 'my-webhook-secret', // notsecret
            privateKey: crypto.generateKeyPairSync('rsa', {
              modulusLength: 2048,
              publicKeyEncoding: { type: 'spki', format: 'pem' },
              privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            }).privateKey,
          },
        ],
      },
    ],
  },
  catalog: {
    locations: [
      {
        type: 'url',
        // import status should be ADDED because it contains a catalog-info.yaml in its default branch
        target:
          'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/blob/main/catalog-info.yaml',
      },
      {
        type: 'url',
        // same repo but with path not to the root of the repo => will be ignored
        target:
          'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/blob/main/path/to/some/other/component/catalog-info.yaml',
      },
      {
        type: 'url',
        // import status should be WAIT_PR_APPROVAL because it does not contain a catalog-info.yaml in its default branch but has an import PR open
        target:
          'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/blob/main/catalog-info.yaml',
      },
      {
        type: 'url',
        // import status should be null because it does not contain a catalog-info.yaml in its default branch and has no an import PR open
        target:
          'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-no-import-pr/blob/main/catalog-info.yaml',
      },
      {
        type: 'url',
        // Location not considered as Import job
        target:
          'https://github.com/my-org-3/another-repo/blob/main/some/path/to/my-component.yaml',
      },
    ],
  },
};

describe('bulk-import router tests', () => {
  const server = setupServer(...DEFAULT_TEST_HANDLERS);

  let mockCatalogClient: CatalogClient;

  beforeAll(() =>
    server.listen({
      /*
       *  This is required so that msw doesn't throw
       *  warnings when the backend is requesting an endpoint
       */
      onUnhandledRequest: (req, print) => {
        if (req.url.pathname.startsWith('/api/bulk-import')) {
          // bypass
          return;
        }
        print.warning();
      },
    }),
  );

  afterAll(() => server.close());

  beforeEach(async () => {
    // TODO(rm3l): Use 'catalogServiceMock' from '@backstage/plugin-catalog-node/testUtils'
    //  once '@backstage/plugin-catalog-node' is upgraded
    mockCatalogClient = {
      getEntities: jest.fn(),
      getEntitiesByRefs: jest.fn(),
      queryEntities: jest.fn(),
      getEntityAncestors: jest.fn(),
      getEntityByRef: jest.fn(),
      removeEntityByUid: jest.fn(),
      refreshEntity: jest.fn(),
      getEntityFacets: jest.fn(),
      getLocationById: jest.fn(),
      getLocationByRef: jest.fn(),
      addLocation: jest.fn(),
      removeLocationById: jest.fn(),
      getLocationByEntity: jest.fn(),
      validateEntity: jest.fn(),
    } as unknown as CatalogClient;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    server.resetHandlers();
  });

  async function startNewBackendServer(
    authorizeResult?: AuthorizeResult.DENY | AuthorizeResult.ALLOW,
    config?: any,
  ) {
    const features: (BackendFeature | Promise<{ default: BackendFeature }>)[] =
      [
        bulkImportPlugin,
        mockServices.rootLogger.factory,
        mockServices.rootConfig.factory({
          data: { ...BASE_CONFIG, ...(config || {}) },
        }),
        mockServices.cache.factory,
        createServiceFactory({
          service: catalogServiceRef,
          deps: {},
          factory: () => mockCatalogClient,
        }),
      ];
    if (authorizeResult) {
      features.push(
        mockServices.permissions.mock({
          authorize: async () => [{ result: authorizeResult }],
        }).factory,
      );
    }
    return startTestBackend({ features }).then(backend => backend.server);
  }

  describe('GET /ping', () => {
    it('returns ok when unauthenticated', async () => {
      const backendServer = await startNewBackendServer();

      const response = await request(backendServer).get(
        '/api/bulk-import/ping',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });

    it('returns ok even when denied by permission framework', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.DENY);

      const response = await request(backendServer).get(
        '/api/bulk-import/ping',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /organizations', () => {
    it('returns 403 when denied by permission framework', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.DENY);

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations',
      );

      expect(response.status).toEqual(403);
    });

    it('returns 200 when organizations are fetched without errors', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        organizations: [
          {
            description: 'A great organization',
            errors: [],
            id: '1',
            name: 'github',
            totalRepoCount: 913,
            url: 'http://localhost:8765/my-org-1',
          },
          {
            description: 'A great organization',
            errors: [],
            id: '111',
            name: 'my-org-1',
            totalRepoCount: 913,
            url: 'http://localhost:8765/my-org-1',
          },
          {
            description: 'A second great organization',
            errors: [],
            id: '222',
            name: 'my-org-2',
            totalRepoCount: 913,
            url: 'http://localhost:8765/my-org-2',
          },
          {
            errors: [],
            id: '1',
            name: 'octocat',
            totalRepoCount: 3134,
            url: 'http://localhost:8765/octocat',
          },
        ],
        pagePerIntegration: 1,
        sizePerIntegration: 20,
        totalCount: 4,
      });
    });

    it('filters out organizations when a search query parameter is provided', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations?search=octo',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        organizations: [
          {
            errors: [],
            id: '1',
            name: 'octocat',
            totalRepoCount: 3134,
            url: 'http://localhost:8765/octocat',
          },
        ],
        pagePerIntegration: 1,
        sizePerIntegration: 20,
        totalCount: 1,
      });
    });

    it('returns 200 with the errors in the body when organizations are fetched, but errors have occurred', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);
      // change the response to 'GET /user/orgs'
      // to simulate an error retrieving list of orgs from GH Token.
      server.use(
        rest.get(`${LOCAL_ADDR}/user/orgs`, (_, res, ctx) => {
          return res(
            ctx.status(403),
            ctx.json({ message: 'Github Token auth did not succeed' }),
          );
        }),
      );

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: ['Github Token auth did not succeed'],
        organizations: [
          {
            errors: [],
            id: '1',
            name: 'octocat',
            totalRepoCount: 3134,
            url: 'http://localhost:8765/octocat',
          },
        ],
        pagePerIntegration: 1,
        sizePerIntegration: 20,
        totalCount: 1,
      });
    });

    it('returns 500 when one or more errors are returned with no successful organization fetched', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);
      // change the responses to simulate error retrieving list of orgs from all GH integrations.
      server.use(
        rest.get(`${LOCAL_ADDR}/user/orgs`, (_, res, ctx) =>
          res(
            ctx.status(403),
            ctx.json({ message: 'Github Token auth did not succeed' }),
          ),
        ),
        rest.get(`${LOCAL_ADDR}/app/installations`, (_, res, ctx) =>
          res(
            ctx.status(403),
            ctx.json({ message: 'Github App auth returned an error' }),
          ),
        ),
      );

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations',
      );

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        errors: [
          'Github Token auth did not succeed',
          'Github App auth returned an error',
        ],
      });
    });
  });

  describe('GET /repositories', () => {
    it('returns 403 when denied by permission framework', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.DENY);

      const response = await request(backendServer).get(
        '/api/bulk-import/repositories',
      );

      expect(response.status).toEqual(403);
    });

    it('returns 200 when repositories are fetched without errors', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);

      const response = await request(backendServer).get(
        '/api/bulk-import/repositories',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [
          {
            defaultBranch: 'master',
            errors: [],
            id: 'octocat/animated-happiness',
            lastUpdate: '2011-01-26T19:14:43Z',
            name: 'animated-happiness',
            organization: 'octocat',
            url: 'http://localhost:8765/octocat/animated-happiness',
          },
          {
            defaultBranch: 'master',
            errors: [],
            id: 'octocat/Hello-World',
            lastUpdate: '2011-01-26T19:14:43Z',
            name: 'Hello-World',
            organization: 'octocat',
            url: 'http://localhost:8765/octocat/Hello-World',
          },
          {
            defaultBranch: 'master',
            errors: [],
            id: 'my-user/Lorem-Ipsum',
            lastUpdate: '2011-01-26T19:14:43Z',
            name: 'Lorem-Ipsum',
            organization: 'my-user',
            url: 'http://localhost:8765/my-user/Lorem-Ipsum',
          },
        ],
        totalCount: 3,
      });
    });

    it('returns 200 with the errors in the body when repositories are fetched, but errors have occurred', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);
      // change the response to 'GET /user/repos'
      // to simulate an error retrieving list of orgs from GH Token.
      server.use(
        rest.get(`${LOCAL_ADDR}/user/repos`, (_, res, ctx) =>
          res(
            ctx.status(403),
            ctx.json({ message: 'Github Token auth did not succeed' }),
          ),
        ),
      );

      const response = await request(backendServer).get(
        '/api/bulk-import/repositories',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: ['Github Token auth did not succeed'],
        repositories: [
          {
            defaultBranch: 'master',
            errors: [],
            id: 'octocat/Hello-World',
            lastUpdate: '2011-01-26T19:14:43Z',
            name: 'Hello-World',
            organization: 'octocat',
            url: 'http://localhost:8765/octocat/Hello-World',
          },
        ],
        totalCount: 1,
      });
    });

    it('returns 500 when one or more errors are returned with no successful repository fetches', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);
      // change the responses to simulate error retrieving list of repos from all GH integrations.
      server.use(
        rest.get(`${LOCAL_ADDR}/user/repos`, (_, res, ctx) =>
          res(
            ctx.status(403),
            ctx.json({ message: 'Github Token auth did not succeed' }),
          ),
        ),
        rest.get(`${LOCAL_ADDR}/app/installations`, (_, res, ctx) =>
          res(
            ctx.status(403),
            ctx.json({ message: 'Github App auth returned an error' }),
          ),
        ),
      );

      const response = await request(backendServer).get(
        '/api/bulk-import/repositories',
      );

      expect(response.status).toEqual(500);
      expect(response.body).toEqual({
        errors: [
          'Github Token auth did not succeed',
          'Github App auth returned an error',
        ],
      });
    });
  });

  describe('GET /organizations/{org}/repositories', () => {
    it('returns 403 when denied by permission framework', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.DENY);

      const response = await request(backendServer).get(
        '/api/bulk-import/organizations/my-ent-org-1/repositories',
      );

      expect(response.status).toEqual(403);
    });

    it('returns 200 when repositories are fetched without errors', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);

      let response = await request(backendServer).get(
        '/api/bulk-import/organizations/my-ent-org-1/repositories',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [
          {
            defaultBranch: 'main',
            errors: [],
            id: 'my-ent-org-1/Hello-World',
            lastUpdate: '2011-01-26T19:14:43Z',
            name: 'Hello-World',
            organization: 'my-ent-org-1',
            url: 'http://localhost:8765/my-ent-org-1/Hello-World',
          },
        ],
        totalCount: 1,
      });

      response = await request(backendServer).get(
        '/api/bulk-import/organizations/my-ent-org-2/repositories',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [
          {
            defaultBranch: 'main',
            errors: [],
            id: 'my-ent-org-2/awesome-dogs',
            lastUpdate: '2011-01-26T19:14:43Z',
            name: 'awesome-dogs',
            organization: 'my-ent-org-2',
            url: 'http://localhost:8765/my-ent-org-2/awesome-dogs',
          },
          {
            defaultBranch: 'main',
            errors: [],
            id: 'my-ent-org-2/lorem-ipsum',
            lastUpdate: '2011-01-26T19:14:43Z',
            name: 'lorem-ipsum',
            organization: 'my-ent-org-2',
            url: 'http://localhost:8765/my-ent-org-2/lorem-ipsum',
          },
        ],
        totalCount: 2,
      });

      response = await request(backendServer).get(
        '/api/bulk-import/organizations/my-ent-org--no-repos/repositories',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        errors: [],
        repositories: [],
        totalCount: 0,
      });
    });

    it('returns 500 when one or more errors are returned with no successful repository fetched', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);
      // change the response to simulate an error retrieving list from GH Token.
      server.use(
        rest.get(`${LOCAL_ADDR}/orgs/some-org/repos`, (_, res, ctx) =>
          res(
            ctx.status(403),
            ctx.json({ message: 'Github Token auth did not succeed' }),
          ),
        ),
      );

      const orgReposResp = await request(backendServer).get(
        '/api/bulk-import/organizations/some-org/repositories',
      );

      expect(orgReposResp.status).toEqual(500);
      expect(orgReposResp.body).toEqual({
        errors: ['Github Token auth did not succeed'],
      });
    });
  });

  describe('GET /imports', () => {
    it('returns 403 when denied by permission framework', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.DENY);

      const response = await request(backendServer).get(
        '/api/bulk-import/imports',
      );

      expect(response.status).toEqual(403);
    });

    it('returns 200 with empty list when there is nothing in catalog yet and no open PR for each repo', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW, {
        catalog: { locations: [] },
      });
      server.use(
        rest.get(
          `http://localhost:${backendServer.port()}/api/catalog/locations`,
          (_, res, ctx) => res(ctx.status(200), ctx.json([])),
        ),
      );
      mockCatalogClient.queryEntities = jest
        .fn()
        .mockResolvedValue({ items: [] });

      const response = await request(backendServer).get(
        '/api/bulk-import/imports',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });

    it('returns 200 with appropriate import status (with data coming from the repos and data coming from the app-config files)', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);
      server.use(
        rest.get(
          `http://localhost:${backendServer.port()}/api/catalog/locations`,
          (_, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json(loadTestFixture('catalog/locations.json')),
            ),
        ),
      );
      mockCatalogClient.queryEntities = jest
        .fn()
        .mockImplementation(
          async (
            _request?: QueryEntitiesRequest,
            _options?: CatalogRequestOptions,
          ): Promise<QueryEntitiesResponse> => {
            return {
              items: [
                {
                  apiVersion: 'backstage.io/v1alpha1',
                  kind: 'Location',
                  metadata: {
                    name: `generated-from-tests-${Math.floor(Math.random() * 100 + 1)}`,
                    namespace: 'default',
                  },
                },
              ],
              totalItems: 1,
              pageInfo: {},
            };
          },
        );

      const response = await request(backendServer).get(
        '/api/bulk-import/imports',
      );

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          approvalTool: 'GIT',
          id: 'https://github.com/octocat/my-awesome-repo',
          lastUpdate: '2011-01-26T19:14:43Z',
          repository: {
            defaultBranch: 'dev',
            id: 'octocat/my-awesome-repo',
            name: 'my-awesome-repo',
            organization: 'octocat',
            url: 'https://github.com/octocat/my-awesome-repo',
          },
          status: null,
        },
        {
          approvalTool: 'GIT',
          id: 'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
          lastUpdate: '2011-01-26T19:14:43Z',
          repository: {
            defaultBranch: 'main',
            id: 'my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
            name: 'my-repo-with-existing-catalog-info-in-default-branch',
            organization: 'my-org-1',
            url: 'https://github.com/my-org-1/my-repo-with-existing-catalog-info-in-default-branch',
          },
          status: 'ADDED',
        },
        {
          approvalTool: 'GIT',
          github: {
            pullRequest: {
              body: 'Onboarding this repository into Red Hat Developer Hub.',
              number: 1347,
              title: 'Add catalog-info.yaml',
              url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pull/1347',
            },
          },
          id: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
          lastUpdate: '2011-01-26T19:01:12Z',
          repository: {
            defaultBranch: 'main',
            id: 'my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
            name: 'my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
            organization: 'my-org-1',
            url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr',
          },
          status: 'WAIT_PR_APPROVAL',
        },
      ]);
      // Location entity refresh triggered (on each 'ADDED' repo)
      expect(mockCatalogClient.refreshEntity).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /imports', () => {
    it('returns 403 when denied by permission framework', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.DENY);

      const response = await request(backendServer)
        .post('/api/bulk-import/imports')
        .send([]);

      expect(response.status).toEqual(403);
    });

    it('returns 400 if there is nothing in request body', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);

      const response = await request(backendServer)
        .post('/api/bulk-import/imports')
        .send([]);

      expect(response.status).toEqual(400);
    });

    it('returns 202 with appropriate import statuses', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);

      mockCatalogClient.addLocation = jest
        .fn()
        .mockImplementation(
          (location: { type: string; target: string; dryRun: boolean }) => {
            let exists = false;
            switch (location.target) {
              case 'https://github.com/my-org-ent-1/java-quarkus-starter/blob/main/catalog-info.yaml':
                exists = true;
                break;
              case 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/blob/dev/catalog-info.yaml':
              case 'https://github.com/my-org-ent-2/animated-happiness/blob/main/catalog-info.yaml':
              default:
                break;
            }
            return Promise.resolve({ exists: exists });
          },
        );
      mockCatalogClient.queryEntities = jest
        .fn()
        .mockImplementation(
          async (
            _request?: QueryEntitiesRequest,
            _options?: CatalogRequestOptions,
          ): Promise<QueryEntitiesResponse> => {
            return {
              items: [
                {
                  apiVersion: 'backstage.io/v1alpha1',
                  kind: 'Location',
                  metadata: {
                    name: `generated-from-tests-${Math.floor(Math.random() * 100 + 1)}`,
                    namespace: 'default',
                  },
                },
              ],
              totalItems: 1,
              pageInfo: {},
            };
          },
        );

      server.use(
        rest.post(
          `http://localhost:${backendServer.port()}/api/catalog/analyze-location`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                existingEntityFiles: [],
                generateEntities: [],
              }),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/contents/catalog-info.yaml`,
          (_req, res, ctx) => res(ctx.status(404)),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/pulls`,
          (_req, res, ctx) => res(ctx.status(200), ctx.json([])),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                name: 'does-not-exist-in-catalog-but-errors-with-pr-creation',
                full_name:
                  'my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
                url: 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
                html_url:
                  'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
                default_branch: 'dev',
                updated_at: '2017-07-08T16:18:44-04:00',
              }),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/ref/heads%2Fdev`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                ref: 'refs/heads/dev',
                node_id: 'MDM6UmVmcmVmcy9oZWFkcy9mZWF0dXJlQQ==',
                url: 'https://api.github.com/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/refs/heads/dev',
                object: {
                  type: 'commit',
                  sha: 'aa218f56b14c9653891f9e74264a383fa43fefbd',
                  url: 'https://api.github.com/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd',
                },
              }),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/ref/heads%2Fbackstage-integration`,
          (_req, res, ctx) => res(ctx.status(404)),
        ),
        rest.post(
          `${LOCAL_ADDR}/repos/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation/git/refs`,
          (_req, res, ctx) =>
            res(
              ctx.status(422),
              ctx.json({
                message: 'unable to create PR due to a server error',
              }),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/contents/catalog-info.yaml`,
          (_req, res, ctx) => res(ctx.status(404)),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/pulls`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json(
                loadTestFixture(
                  'github/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pulls/open.json',
                ),
              ),
            ),
        ),
        rest.patch(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/pulls/1347`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json(
                loadTestFixture(
                  'github/repos/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pulls/open.json',
                )[0],
              ),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/contents/catalog-info.yaml`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json(
                loadTestFixture(
                  'github/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contents/catalog-info.yaml.json',
                ),
              ),
            ),
        ),
        rest.put(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/contents/catalog-info.yaml`,
          (_req, res, ctx) =>
            res(
              ctx.status(201),
              ctx.json({
                content: loadTestFixture(
                  'github/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contents/catalog-info.yaml.json',
                ),
              }),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                name: 'animated-happiness',
                full_name: 'my-org-ent-2/animated-happiness',
                url: 'https://github.com/my-org-ent-2/animated-happiness',
                html_url: 'https://github.com/my-org-ent-2/animated-happiness',
                default_branch: 'main',
                updated_at: '2017-07-08T16:18:44-04:00',
              }),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/git/ref/heads%2Fmain`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                ref: 'refs/heads/main',
                node_id: 'MDM6UmVmcmVmcy9oZWFkcy9mZWF0dXJlQQ==',
                url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/refs/heads/main',
                object: {
                  type: 'commit',
                  sha: 'aa218f56b14c9653891f9e74264a383fa43fefbd',
                  url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd',
                },
              }),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/git/ref/heads%2Fbackstage-integration`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                ref: 'refs/heads/backstage-integration',
                node_id: 'MDM6UmVmcmVmcy9oZWFkcy9mZWF0dXJlQQ==',
                url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/refs/heads/backstage-integration',
                object: {
                  type: 'commit',
                  sha: 'aa218f56b14c9653891f9e74264a383fa43fefbd',
                  url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/commits/aa218f56b14c9653891f9e74264a383fa43fefbd',
                },
              }),
            ),
        ),
        rest.post(
          `${LOCAL_ADDR}/repos/my-org-ent-2/animated-happiness/git/refs`,
          (_req, res, ctx) =>
            res(
              ctx.status(201),
              ctx.json({
                ref: 'refs/heads/backstage-integration',
                node_id: 'MDM6UmVmcmVmcy9oZWFkcy9mZWF0dXJlQQ==',
                url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/refs/heads/featureA',
                object: {
                  type: 'commit',
                  sha: 'ca218f56b14c9653891f9e74264a383fa43fefbd',
                  url: 'https://api.github.com/repos/my-org-ent-2/animated-happiness/git/commits/ca218f56b14c9653891f9e74264a383fa43fefbd',
                },
              }),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/java-quarkus-starter/contents/catalog-info.yaml`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json(
                loadTestFixture(
                  'github/repos/my-org-1/my-repo-with-existing-catalog-info-in-default-branch/contents/catalog-info.yaml.json',
                ),
              ),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/java-quarkus-starter`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json({
                name: 'animated-happiness',
                full_name: 'my-org-ent-1/java-quarkus-starter',
                url: 'https://github.com/my-org-ent-1/java-quarkus-starter',
                html_url:
                  'https://github.com/my-org-ent-1/java-quarkus-starter',
                default_branch: 'main',
                updated_at: '2024-07-08T16:18:44-04:00',
              }),
            ),
        ),
      );

      const response = await request(backendServer)
        .post('/api/bulk-import/imports')
        .send([
          {
            repository: {
              url: 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
              defaultBranch: 'dev',
            },
          },
          {
            repository: {
              url: 'https://github.com/my-org-ent-2/animated-happiness',
              defaultBranch: 'main',
            },
            catalogInfoContent: `---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: animated-happiness
  annotations:
    github.com/project-slug: my-org-ent-2/animated-happiness
spec:
  type: other
  lifecycle: unknown
  owner: my-org-ent-2
---
`,
            github: {
              pullRequest: {
                title: 'Custom PR title: catalog-info.yaml',
              },
            },
          },
          {
            repository: {
              url: 'https://github.com/my-org-ent-1/java-quarkus-starter',
              defaultBranch: 'main',
            },
          },
        ]);

      expect(response.status).toEqual(202);
      expect(response.body).toEqual([
        {
          errors: ['unable to create PR due to a server error'],
          repository: {
            defaultBranch: 'dev',
            url: 'https://github.com/my-org-ent-1/does-not-exist-in-catalog-but-errors-with-pr-creation',
          },
          status: 'PR_ERROR',
        },
        {
          github: {
            pullRequest: {
              number: 1347,
              url: 'https://github.com/my-org-1/my-repo-with-no-catalog-info-in-default-branch-and-import-pr/pull/1347',
            },
          },
          lastUpdate: '2011-01-26T19:01:12Z',
          repository: {
            name: 'animated-happiness',
            organization: 'my-org-ent-2',
            url: 'https://github.com/my-org-ent-2/animated-happiness',
          },
          status: 'WAIT_PR_APPROVAL',
        },
        {
          lastUpdate: '2024-07-08T16:18:44-04:00',
          repository: {
            name: 'java-quarkus-starter',
            organization: 'my-org-ent-1',
            url: 'https://github.com/my-org-ent-1/java-quarkus-starter',
          },
          status: 'ADDED',
        },
      ]);
      // Location entity refresh triggered (on each 'ADDED' repo)
      expect(mockCatalogClient.refreshEntity).toHaveBeenCalledTimes(1);
    });

    it('return dry-run results in errors array for each item in request body', async () => {
      const backendServer = await startNewBackendServer(AuthorizeResult.ALLOW);

      mockCatalogClient.queryEntities = jest.fn().mockImplementation(
        async (req: {
          filter: {
            'metadata.name': string;
          };
        }) => {
          if (req.filter['metadata.name'] === 'my-entity-b') {
            return {
              totalItems: 1,
              items: [
                {
                  apiVersion: 'backstage.io/v1alpha1',
                  kind: 'Component',
                  component: {
                    name: 'my-entity-b',
                  },
                },
              ],
            };
          }
          return { totalItems: 0, items: [] };
        },
      );
      server.use(
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/my-repo-a/contributors`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json([loadTestFixture('github/user/user.json')]),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-1/my-repo-a/contents/catalog-info.yaml`,
          (_req, res, ctx) => res(ctx.status(404)),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-b/contributors`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json([loadTestFixture('github/user/user.json')]),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-b/contents/catalog-info.yaml`,
          (_req, res, ctx) => res(ctx.status(200)),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-c/contributors`,
          (_req, res, ctx) =>
            res(
              ctx.status(204), // repo empty
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-c/contents/catalog-info.yaml`,
          (_req, res, ctx) => res(ctx.status(404)),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-d/contributors`,
          (_req, res, ctx) =>
            res(
              ctx.status(200),
              ctx.json([loadTestFixture('github/user/user.json')]),
            ),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-d/contents/catalog-info.yaml`,
          (_req, res, ctx) => res(ctx.status(404)),
        ),
        rest.get(
          `${LOCAL_ADDR}/repos/my-org-ent-2/my-repo-d/contents/.github%2FCODEOWNERS`,
          (_req, res, ctx) => res(ctx.status(404)),
        ),
      );

      const response = await request(backendServer)
        .post('/api/bulk-import/imports')
        .query({ dryRun: true })
        .send([
          {
            // catalogEntityName not specified => catalog entity checks will be skipped
            repository: {
              url: 'https://github.com/my-org-ent-1/my-repo-a',
              defaultBranch: 'dev',
            },
          },
          {
            catalogEntityName: 'my-entity-b',
            repository: {
              url: 'https://github.com/my-org-ent-2/my-repo-b',
              defaultBranch: 'main',
            },
          },
          {
            catalogEntityName: 'my-entity-c',
            repository: {
              url: 'https://github.com/my-org-ent-2/my-repo-c',
              defaultBranch: 'trunk',
            },
          },
          {
            catalogEntityName: 'my-entity-d',
            codeOwnersFileAsEntityOwner: true,
            repository: {
              url: 'https://github.com/my-org-ent-2/my-repo-d',
              defaultBranch: 'devBranch',
            },
          },
        ]);
      expect(response.status).toEqual(202);
      expect(response.body).toEqual([
        {
          errors: [],
          repository: {
            url: 'https://github.com/my-org-ent-1/my-repo-a',
            name: 'my-repo-a',
            organization: 'my-org-ent-1',
          },
        },
        {
          errors: [
            'CATALOG_ENTITY_CONFLICT',
            'CATALOG_INFO_FILE_EXISTS_IN_REPO',
          ],
          catalogEntityName: 'my-entity-b',
          repository: {
            url: 'https://github.com/my-org-ent-2/my-repo-b',
            name: 'my-repo-b',
            organization: 'my-org-ent-2',
          },
        },
        {
          errors: ['REPO_EMPTY'],
          catalogEntityName: 'my-entity-c',
          repository: {
            url: 'https://github.com/my-org-ent-2/my-repo-c',
            name: 'my-repo-c',
            organization: 'my-org-ent-2',
          },
        },
        {
          errors: ['CODEOWNERS_FILE_NOT_FOUND_IN_REPO'],
          catalogEntityName: 'my-entity-d',
          repository: {
            url: 'https://github.com/my-org-ent-2/my-repo-d',
            name: 'my-repo-d',
            organization: 'my-org-ent-2',
          },
        },
      ]);
    });
  });
});

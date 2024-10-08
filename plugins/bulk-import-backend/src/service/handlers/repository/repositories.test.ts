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

import { AuthorizeResult } from '@backstage/plugin-permission-common';

import { rest } from 'msw';
import request from 'supertest';

import { LOCAL_ADDR } from '../../../../__fixtures__/handlers';
import {
  addHandlersForGHTokenAppErrors,
  setupTest,
  startBackendServer,
} from '../../../../__fixtures__/testUtils';

describe('repositories', () => {
  const useTestData = setupTest();

  describe('GET /repositories', () => {
    it('returns 200 when repositories are fetched without errors', async () => {
      const { mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );

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
      const { server, mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );
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
      const { server, mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );
      // change the responses to simulate error retrieving list of repos from all GH integrations.
      addHandlersForGHTokenAppErrors(server);

      const reposResp = await request(backendServer).get(
        '/api/bulk-import/repositories',
      );

      expect(reposResp.status).toEqual(500);
      expect(reposResp.body).toEqual({
        errors: [
          'Github Token auth did not succeed',
          'Github App auth returned an error',
        ],
      });
    });
  });

  describe('GET /organizations/{org}/repositories', () => {
    it('returns 200 when repositories are fetched without errors', async () => {
      const { mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );

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
      const { server, mockCatalogClient } = useTestData();
      const backendServer = await startBackendServer(
        mockCatalogClient,
        AuthorizeResult.ALLOW,
      );
      // change the response to simulate an error retrieving list from GH Token.
      addHandlersForGHTokenAppErrors(server);

      const orgReposResp = await request(backendServer).get(
        '/api/bulk-import/organizations/some-org/repositories',
      );

      expect(orgReposResp.status).toEqual(500);
      expect(orgReposResp.body).toEqual({
        errors: ['Github Token auth did not succeed'],
      });
    });
  });
});
